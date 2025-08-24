import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import YAML from 'yaml';
import { fileURLToPath } from 'url';
import session from 'express-session';
import FileStoreFactory from 'session-file-store';
import { OAuth2Client } from 'google-auth-library';
// Removed anvilPool import - using Hardhat only for MVP

const app = express();
// Optional allowlist via env FRONTEND_ORIGIN (comma-separated). Defaults to * during MVP.
const allowlist = (process.env.FRONTEND_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (allowlist.length === 0) return cb(null, true);
    if (!origin) return cb(null, false);
    cb(null, allowlist.includes(origin));
  },
  credentials: true
}));
app.use(express.json());

// Session (for auth). Configure for dev proxy environment
const isHttps = (process.env.PUBLIC_BASE_URL || '').startsWith('https://');
app.use(
  session({
    store: new (FileStoreFactory(session))({ path: path.join(process.cwd(), '.data', 'sessions'), retries: 0 }),
    secret: process.env.SESSION_SECRET || 'dev-insecure-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isHttps,
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

function listYamlFilesRecursively(rootDir) {
  const out = [];
  const stack = [rootDir];
  while (stack.length) {
    const dir = stack.pop();
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.isFile() && e.name.endsWith('.yaml')) out.push(p);
    }
  }
  return out;
}
function readExerciseDoc(p) {
  const txt = fs.readFileSync(p, 'utf8');
  return YAML.parse(txt);
}
function findExerciseById(exerciseId) {
  const root = path.join(process.cwd(), 'exercises');
  for (const p of listYamlFilesRecursively(root)) {
    try {
      const doc = readExerciseDoc(p);
      if (doc?.id === exerciseId) return doc;
    } catch {}
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

app.get('/api/auth/google/start', (req, res) => {
  const client = getOAuthClient();
  if (!client) return res.status(500).json({ error: 'oauth_not_configured' });
  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'select_account',
    scope: ['openid', 'email', 'profile'],
  });
  res.redirect(url);
});

app.get('/api/auth/google/callback', async (req, res) => {
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

app.get('/api/auth/me', (req, res) => {
  res.json({ user: req.session.user || null });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Basic sitemap.xml (list exercises and core pages)
app.get('/api/sitemap.xml', (_req, res) => {
  const base = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
  const dir = path.join(process.cwd(), 'exercises');
  const urls = [
    `${base}/`,
    `${base}/#/`,
  ];
  for (const p of listYamlFilesRecursively(dir)) {
    try {
      const d = readExerciseDoc(p);
      if (d?.id) urls.push(`${base}/#/exercises/${d.id}`);
    } catch {}
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(u => `  <url><loc>${u}</loc></url>`)
    .join('\n')}\n</urlset>`;
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/api/exercises', (_req, res) => {
  const dir = path.join(process.cwd(), 'exercises');
  const items = listYamlFilesRecursively(dir).map((p) => {
    const d = readExerciseDoc(p);
    return { id: d.id, title: d.title, difficulty: d.difficulty, tags: d.tags || [], category: d.category || null };
  });
  res.json(items);
});

app.get('/api/exercises/:id', (req, res) => {
  const doc = findExerciseById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'not_found' });
  const safe = {
    id: doc.id,
    title: doc.title,
    category: doc.category || null,
    difficulty: doc.difficulty,
    tags: doc.tags || [],
    objectives: doc.objectives || [],
    description: doc.description || '',
    hints: doc.hints || [],
    starter: doc.starter || { files: [] },
    tests: { files: (doc.tests?.files || []).map((f) => ({ path: f.path })) },
    visibility: doc.visibility || 'after-pass',
    explanation: doc.explanation || ''
  };
  res.json(safe);
});

// Return full solution files for an exercise (MVP: ungated)
function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'unauthorized' });
  next();
}

app.get('/api/exercises/:id/solution', requireAuth, (req, res) => {
  const doc = findExerciseById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'not_found' });
  const visibility = doc.visibility || 'after-pass';
  // If authors explicitly set to never, still forbid; otherwise allow for logged-in users
  if (visibility === 'never') return res.status(403).json({ error: 'forbidden' });
  const files = doc.solution?.files || [];
  res.json({ id: doc.id, files });
});

function makeSid() {
  return 'sub_' + Math.random().toString(36).slice(2, 10);
}

app.post('/api/submissions', async (req, res) => {
  const { id, mode, overrides, deviceId } = req.body || {};
  if (!id) return res.status(400).json({ error: 'missing_id' });
  const doc = findExerciseById(id);
  if (!doc) return res.status(404).json({ error: 'exercise_not_found' });

  const useSolution = mode === 'solution';
  const sid = makeSid();
  const userId = req.session.user?.id || null;
  try {
    console.log(JSON.stringify({ type: 'job_received', sid, exerciseId: id, mode, userId, deviceId: deviceId || null, ts: Date.now() }));

  const args = ['scripts/run-exercise.js', '--id', id];
  if (useSolution) args.push('--solution');
  const child = spawn('node', args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      RUN_OVERRIDES: overrides && Array.isArray(overrides) ? JSON.stringify(overrides) : undefined,
    },
  });
  console.log(JSON.stringify({ type: 'runner_spawn', sid, args, ts: Date.now() }));

  submissions.set(sid, { child, startedAt: Date.now(), exerciseId: id, deviceId: deviceId || null, userId });

  child.on('error', (err) => {
    console.log(JSON.stringify({ type: 'runner_error', sid, message: String(err?.message || err), ts: Date.now() }));
  });

  child.on('close', async (code) => {
    setTimeout(() => submissions.delete(sid), 5 * 60 * 1000);
  });

  res.json({ submissionId: sid });
  } catch (e) {
    console.log(JSON.stringify({ type: 'job_error', sid, exerciseId: id, message: String(e?.message || e), ts: Date.now() }));
    res.status(500).json({ error: 'spawn_failed' });
  }
});

app.get('/api/submissions/:sid/stream', (req, res) => {
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

  let totalBytes = 0;
  const MAX_BYTES = 200 * 1024; // 200KB per run
  const startedAt = Date.now();
  const onChunk = (stream, buf) => {
    if (!buf) return;
    const s = buf.toString();
    totalBytes += Buffer.byteLength(s);
    if (totalBytes <= MAX_BYTES) send('log', { stream, chunk: s });
    else if (totalBytes - Buffer.byteLength(s) < MAX_BYTES) send('log', { stream, chunk: '\n[truncated]\n' });
  };
  const onStdout = (d) => onChunk('stdout', d);
  const onStderr = (d) => onChunk('stderr', d);
  child.stdout.on('data', onStdout);
  child.stderr.on('data', onStderr);

  // Timeout/kill runaway runs
  const KILL_AFTER_MS = 180 * 1000; // allow slower first runs (installs) during MVP
  const killer = setTimeout(() => {
    try { child.kill('SIGKILL'); } catch {}
  }, KILL_AFTER_MS);

  // SSE keepalive
  const keep = setInterval(() => { res.write(':keepalive\n\n'); }, 15000);

  child.on('close', (code) => {
    clearTimeout(killer);
    clearInterval(keep);
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
    const ms = Date.now() - startedAt;
    const truncated = totalBytes > MAX_BYTES;
    console.log(JSON.stringify({ type: 'stream_done', sid: req.params.sid, code, ms, bytes: totalBytes, truncated, ts: Date.now() }));
    res.end();
  });

  req.on('close', () => {
    child.stdout.off('data', onStdout);
    child.stderr.off('data', onStderr);
  });
});

// Progress by deviceId (legacy for anonymous users)
app.get('/api/progress', (req, res) => {
  const deviceId = req.query.deviceId;
  const db = readProgress();
  if (!deviceId) return res.json({ solved: {} });
  const rec = db[`d:${deviceId}`] || { solved: {} };
  res.json(rec);
});

// Progress for logged-in user
app.get('/api/me/progress', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'unauthorized' });
  const db = readProgress();
  const rec = db[`u:${req.session.user.id}`] || { solved: {} };
  res.json(rec);
});

// Merge device progress into user
app.post('/api/me/progress/migrate', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'unauthorized' });
  const deviceId = req.body?.deviceId;
  if (!deviceId) return res.status(400).json({ error: 'missing_deviceId' });
  const db = readProgress();
  const uKey = `u:${req.session.user.id}`;
  const dKey = `d:${deviceId}`;
  const u = db[uKey] || { solved: {} };
  const d = db[dKey] || { solved: {} };
  db[uKey] = { solved: { ...d.solved, ...u.solved } };
  writeProgress(db);
  return res.json({ ok: true, merged: Object.keys(d.solved || {}).length });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  // Removed anvilPool.init() - using Hardhat only for MVP
  console.log(`API listening on :${PORT}`);
});

