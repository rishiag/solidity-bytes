import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import YAML from 'yaml';
import { fileURLToPath } from 'url';
import session from 'express-session';
import { OAuth2Client } from 'google-auth-library';

const app = express();
// Optional allowlist via env FRONTEND_ORIGIN (comma-separated). Defaults to * during MVP.
const allowlist = (process.env.FRONTEND_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (allowlist.length === 0) return cb(null, true);
    if (!origin) return cb(null, false);
    cb(null, allowlist.includes(origin));
  }
}));
app.use(express.json());

// Session (for auth). On localhost we use non-secure cookies.
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-insecure-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const submissions = new Map(); // sid -> { child, startedAt, exerciseId, deviceId, userId }
const dataDir = path.join(process.cwd(), '.data');
const progressFile = path.join(dataDir, 'progress.json');
function readProgress() {
  try {
    if (!fs.existsSync(progressFile)) return {};
    return JSON.parse(fs.readFileSync(progressFile, 'utf8'));
  } catch {
    return {};
  }
}
function writeProgress(obj) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(progressFile, JSON.stringify(obj, null, 2));
}

function listExercisesDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => path.join(dir, f));
}
function readExerciseDoc(p) {
  const txt = fs.readFileSync(p, 'utf8');
  return YAML.parse(txt);
}
function findExerciseById(exerciseId) {
  const roots = [
    path.join(process.cwd(), 'exercises', 'track-a-basics'),
    path.join(process.cwd(), 'exercises', '_examples'),
  ];
  for (const r of roots) {
    for (const p of listExercisesDir(r)) {
      try {
        const doc = readExerciseDoc(p);
        if (doc?.id === exerciseId) return doc;
      } catch {}
    }
  }
  return null;
}

// --- Google OAuth (MVP) ---
function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const base = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
  const redirectUri = `${base}/api/auth/google/callback`;
  if (!clientId || !clientSecret) return null;
  return new OAuth2Client({ clientId, clientSecret, redirectUri });
}

app.get('/auth/google/start', (req, res) => {
  const client = getOAuthClient();
  if (!client) return res.status(500).json({ error: 'oauth_not_configured' });
  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'select_account',
    scope: ['openid', 'email', 'profile'],
  });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const client = getOAuthClient();
    if (!client) return res.status(500).send('OAuth not configured');
    const code = req.query.code;
    if (!code) return res.status(400).send('Missing code');
    const { tokens } = await client.getToken(String(code));
    if (!tokens?.id_token) return res.status(400).send('Missing id_token');
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    req.session.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
    res.redirect('/#/');
  } catch (e) {
    res.status(500).send('Auth failed');
  }
});

app.get('/auth/me', (req, res) => {
  res.json({ user: req.session.user || null });
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/exercises', (_req, res) => {
  const dir = path.join(process.cwd(), 'exercises', 'track-a-basics');
  const items = listExercisesDir(dir).map((p) => {
    const d = readExerciseDoc(p);
    return { id: d.id, title: d.title, difficulty: d.difficulty, tags: d.tags || [] };
  });
  res.json(items);
});

app.get('/exercises/:id', (req, res) => {
  const doc = findExerciseById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'not_found' });
  const safe = {
    id: doc.id,
    title: doc.title,
    difficulty: doc.difficulty,
    tags: doc.tags || [],
    objectives: doc.objectives || [],
    description: doc.description || '',
    hints: doc.hints || [],
    starter: doc.starter || { files: [] },
    tests: { files: (doc.tests?.files || []).map((f) => ({ path: f.path })) },
    visibility: doc.visibility || 'after-pass',
  };
  res.json(safe);
});

// Return full solution files for an exercise (MVP: ungated)
function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'unauthorized' });
  next();
}

app.get('/exercises/:id/solution', requireAuth, (req, res) => {
  const doc = findExerciseById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'not_found' });
  const files = doc.solution?.files || [];
  res.json({ id: doc.id, files });
});

function makeSid() {
  return 'sub_' + Math.random().toString(36).slice(2, 10);
}

app.post('/submissions', (req, res) => {
  const { id, mode, overrides, deviceId } = req.body || {};
  if (!id) return res.status(400).json({ error: 'missing_id' });
  const doc = findExerciseById(id);
  if (!doc) return res.status(404).json({ error: 'exercise_not_found' });

  const useSolution = mode === 'solution';
  const sid = makeSid();

  const args = ['scripts/run-exercise.js', '--id', id];
  if (useSolution) args.push('--solution');
  const child = spawn('node', args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      RUN_OVERRIDES: overrides && Array.isArray(overrides) ? JSON.stringify(overrides) : undefined,
    },
  });

  const userId = req.session.user?.id || null;
  submissions.set(sid, { child, startedAt: Date.now(), exerciseId: id, deviceId: deviceId || null, userId });

  child.on('close', () => {
    setTimeout(() => submissions.delete(sid), 5 * 60 * 1000);
  });

  res.json({ submissionId: sid });
});

app.get('/submissions/:sid/stream', (req, res) => {
  const entry = submissions.get(req.params.sid);
  if (!entry) return res.status(404).end();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const { child } = entry;

  const onStdout = (d) => send('log', { stream: 'stdout', chunk: d.toString() });
  const onStderr = (d) => send('log', { stream: 'stderr', chunk: d.toString() });
  child.stdout.on('data', onStdout);
  child.stderr.on('data', onStderr);

  child.on('close', (code) => {
    const entry2 = submissions.get(req.params.sid);
    if (entry2?.exerciseId && code === 0) {
      const db = readProgress();
      if (entry2.userId) {
        const key = `u:${entry2.userId}`;
        const rec = db[key] || { solved: {} };
        rec.solved[entry2.exerciseId] = true;
        db[key] = rec;
      } else if (entry2.deviceId) {
        const key = `d:${entry2.deviceId}`;
        const rec = db[key] || { solved: {} };
        rec.solved[entry2.exerciseId] = true;
        db[key] = rec;
      }
      writeProgress(db);
    }
    send('done', { code });
    res.end();
  });

  req.on('close', () => {
    child.stdout.off('data', onStdout);
    child.stderr.off('data', onStderr);
  });
});

// Progress by deviceId (legacy for anonymous users)
app.get('/progress', (req, res) => {
  const deviceId = req.query.deviceId;
  const db = readProgress();
  if (!deviceId) return res.json({ solved: {} });
  const rec = db[`d:${deviceId}`] || { solved: {} };
  res.json(rec);
});

// Progress for logged-in user
app.get('/me/progress', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'unauthorized' });
  const db = readProgress();
  const rec = db[`u:${req.session.user.id}`] || { solved: {} };
  res.json(rec);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API listening on :${PORT}`));

