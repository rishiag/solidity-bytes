#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

function die(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { track: null, verbose: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--track') out.track = args[++i];
    else if (a === '--vv' || a === '--verbose') out.verbose = true;
  }
  return out;
}

function findYamls(baseDir, track) {
  const dirs = [];
  if (track) dirs.push(path.join(baseDir, 'exercises', track));
  else {
    dirs.push(path.join(baseDir, 'exercises', '_examples'));
    const exRoot = path.join(baseDir, 'exercises');
    for (const entry of fs.readdirSync(exRoot)) {
      const p = path.join(exRoot, entry);
      if (fs.statSync(p).isDirectory() && entry !== '_examples') dirs.push(p);
    }
  }
  const yamls = [];
  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) if (f.endsWith('.yaml')) yamls.push(path.join(d, f));
  }
  return yamls;
}

function runOne(id, verbose) {
  const args = ['scripts/run-exercise.js', '--id', id, '--solution'];
  if (verbose) args.push('--vv');
  const res = spawnSync('node', args, { stdio: verbose ? 'inherit' : 'pipe' });
  return res.status === 0;
}

function main() {
  const args = parseArgs();
  const root = process.cwd();
  const yamls = findYamls(root, args.track);
  if (yamls.length === 0) die('No exercises found');

  let pass = 0;
  let fail = 0;
  for (const y of yamls) {
    const txt = fs.readFileSync(y, 'utf8');
    const idMatch = txt.match(/^id:\s*(.+)$/m);
    const id = idMatch ? idMatch[1].trim() : null;
    if (!id) {
      console.error(`Skipping (no id): ${y}`);
      fail++;
      continue;
    }
    console.log(`\n=== Running ${id} ===`);
    const ok = runOne(id, args.verbose);
    if (ok) pass++; else fail++;
  }
  console.log(`\nSummary: pass=${pass} fail=${fail} total=${pass + fail}`);
  process.exit(fail === 0 ? 0 : 1);
}

main();

