#!/usr/bin/env node
/* Minimal local runner: runs an exercise's starter or solution tests with Hardhat */
import fs from 'fs-extra';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function die(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { id: null, useSolution: false, verbose: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--id') out.id = args[++i];
    else if (a === '--solution') out.useSolution = true;
    else if (a === '--vv' || a === '--verbose') out.verbose = true;
  }
  if (!out.id) die('Usage: node scripts/run-exercise.js --id <exercise-id> [--solution] [--vv]');
  return out;
}

function findExerciseYaml(exerciseId) {
  const root = path.join(process.cwd(), 'exercises');
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    if (!fs.existsSync(dir)) continue;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) stack.push(p);
      else if (ent.isFile() && ent.name.endsWith('.yaml')) {
        try {
          const txt = fs.readFileSync(p, 'utf8');
          const doc = YAML.parse(txt);
          if (doc?.id === exerciseId) return { path: p, doc };
        } catch {}
      }
    }
  }
  die(`Exercise not found: ${exerciseId}`);
}

// Use a stable workspace per exercise to cache node_modules across runs
function makeWorkdir(exerciseId) {
  const base = path.join(process.cwd(), '.runner', 'workspaces');
  fs.mkdirpSync(base);
  const dir = path.join(base, exerciseId);
  fs.mkdirpSync(dir);
  return dir;
}

function cleanWorkdirPreserveDeps(workdir) {
  const keep = new Set(['node_modules', 'package-lock.json', '.deps.hash']);
  if (!fs.existsSync(workdir)) return;
  for (const entry of fs.readdirSync(workdir)) {
    if (keep.has(entry)) continue;
    fs.removeSync(path.join(workdir, entry));
  }
}

function writeFiles(files, workdir) {
  for (const f of files) {
    const dest = path.join(workdir, f.path);
    fs.mkdirpSync(path.dirname(dest));
    fs.writeFileSync(dest, f.content, 'utf8');
  }
}

function desiredPkg() {
  return {
    name: 'exercise-runner',
    private: true,
    version: '0.0.0',
    scripts: { test: 'hardhat test' },
    dependencies: {
      hardhat: '^2.22.5',
      '@nomicfoundation/hardhat-toolbox': '^4.0.0',
      ethers: '^6.12.0',
      chai: '^4.3.10',
      mocha: '^10.4.0'
    }
  };
}

function ensurePkg(workdir) {
  const pkgPath = path.join(workdir, 'package.json');
  const pkg = desiredPkg();
  // Always (re)write package.json to keep in sync with runner spec
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  return pkg;
}

function pkgHash(pkgObj) {
  const json = JSON.stringify(pkgObj);
  return crypto.createHash('sha256').update(json).digest('hex');
}

function shouldInstallDeps(workdir, pkgObj) {
  const nm = path.join(workdir, 'node_modules');
  const hashPath = path.join(workdir, '.deps.hash');
  if (!fs.existsSync(nm)) return true;
  const want = pkgHash(pkgObj);
  try {
    const have = fs.readFileSync(hashPath, 'utf8').trim();
    return have !== want;
  } catch {
    return true;
  }
}

async function npmInstallIfNeeded(workdir, pkgObj, verbose) {
  const need = shouldInstallDeps(workdir, pkgObj);
  if (!need) {
    if (!verbose) process.stdout.write('(runner) Reusing cached dependencies\n');
    return;
  }
  if (!verbose) process.stdout.write('(runner) Installing dependencies...\n');
  try {
    // Prefer ci for speed/determinism if lock exists, fall back to install
    const hasLock = fs.existsSync(path.join(workdir, 'package-lock.json'));
    const cmd = hasLock ? 'npm ci --silent --no-audit --no-fund' : 'npm i --silent --no-audit --no-fund';
    execSync(cmd, { cwd: workdir, stdio: verbose ? 'inherit' : 'ignore' });
    fs.writeFileSync(path.join(workdir, '.deps.hash'), pkgHash(pkgObj));
  } catch (e) {
    die('npm install failed. Check network and try again.');
  }
}

async function runTests(workdir, verbose) {
  return new Promise((resolve) => {
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const p = spawn(cmd, ['hardhat', 'test'], {
      cwd: workdir,
      stdio: verbose ? 'inherit' : 'pipe',
      env: {
        ...process.env,
        // Suppress Hardhat's node version warning in the runner context
        HARDHAT_DISABLE_NODEJS_WARNING: '1',
      }
    });
    let out = '';
    if (!verbose) {
      p.stdout.on('data', (d) => (out += d.toString()));
      p.stderr.on('data', (d) => (out += d.toString()));
    }
    p.on('close', (code) => {
      if (!verbose) process.stdout.write(out);
      resolve(code);
    });
  });
}

async function main() {
  const args = parseArgs();
  const { doc } = findExerciseYaml(args.id);
  const workdir = makeWorkdir(doc.id);
  cleanWorkdirPreserveDeps(workdir);

  const section = args.useSolution ? 'solution' : 'starter';
  if (!doc[section]?.files?.length || !doc.tests?.files?.length) {
    die(`Exercise ${doc.id} missing ${section}.files or tests.files`);
  }

  writeFiles(doc[section].files, workdir);
  writeFiles(doc.tests.files, workdir);

  // Apply overrides from env if provided: RUN_OVERRIDES='[{"path":"contracts/X.sol","content":"..."}]'
  if (process.env.RUN_OVERRIDES) {
    try {
      const overrides = JSON.parse(process.env.RUN_OVERRIDES);
      if (Array.isArray(overrides)) writeFiles(overrides, workdir);
    } catch (e) {
      console.error('Invalid RUN_OVERRIDES JSON; ignoring');
    }
  }

  const hhCfg = path.join(workdir, 'hardhat.config.js');
  const hhCfgCjs = path.join(workdir, 'hardhat.config.cjs');
  if (!fs.existsSync(hhCfg) && !fs.existsSync(hhCfgCjs)) {
    fs.writeFileSync(
      hhCfgCjs,
      'require("@nomicfoundation/hardhat-toolbox");module.exports={solidity:"0.8.20"};'
    );
  }

  const pkgObj = ensurePkg(workdir);
  await npmInstallIfNeeded(workdir, pkgObj, args.verbose);
  const code = await runTests(workdir, args.verbose);
  process.exit(code);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

