## Soliditybytes — JS-only plan

This document defines the end-to-end plan to ship a Solidity learning MVP with a JavaScript-only stack.

### Goals
- Reduce time-to-productive Solidity learning with zero local setup
- Provide real execution feedback (compile, deploy, test) inside the browser workflow
- Ship 40–50 high-quality exercises across core Solidity topics

### Non-goals (MVP)
- Browser extension wallet, public testnets/mainnet
- Security exploit labs and mainnet-fork scenarios
- Community authoring portal

---

## Phases, deliverables, and success criteria

### Phase 0 — Product definition and content spec (3–5 days)
- Objectives
  - Define learner outcomes per track (beginner → ERCs)
  - Finalize exercise schema and authoring workflow
  - Draft first 30 exercise specs (objectives, hints, acceptance)
- Deliverables
  - `exercise.schema.json` + author style guide
  - 30 exercise YAMLs with titles, objectives, hints, acceptance checks
  - UI wireframes for problem and progress pages
- Success criteria
  - Clear track map (6–8 tracks)
  - 30 exercises scoped with unambiguous pass/fail criteria

### Phase 1 — Runner spike (server executes Solidity) (4–6 days)
- Approach
  - Hardhat (JavaScript) + Mocha/Chai tests
  - Execute each submission in an ephemeral Docker container with CPU/mem/time limits
  - No outbound network from containers; mount only exercise workspace
- Deliverables
  - Docker image: Node LTS + Hardhat + pinned solc versions
  - Starter exercise with tests that pass locally and in-container
  - Script to run an exercise end-to-end from a folder
- Success criteria
  - Cold run: < 20s; warm run: < 10s
  - Reproducible sandboxed results

### Phase 2 — Backend API and job orchestration (5–7 days)
- Backend (Node.js + Express)
  - Endpoints: auth, list exercises, get exercise, submit solution, stream logs, results, progress
  - Job queue (BullMQ or bee-queue) to run submissions in Docker with timeouts
  - Postgres for users, exercises, submissions, results, progress, rate limits
- Deliverables
  - API with JWT sessions; runner workers; log streaming via WebSocket/SSE
  - Basic admin route to publish/revise exercises
- Success criteria
  - Submit → streamed compile/test logs → final verdict
  - Handle 10 concurrent runs on a dev VM without timeouts
  - Quotas and per-IP rate limits active

### Phase 3 — Frontend MVP (Next.js, JavaScript) (5–7 days)
- UI/UX
  - Problem page: statement, Monaco editor, “Run tests”, terminal pane, hints/solutions
  - Progress page: solved/attempted, track view, XP/streak
  - Explore page: filter by difficulty/tags
- Deliverables
  - Next.js app (JS) with auth, editor, log streaming, results display, progress persistence
  - Client validations with `solhint` and formatting with `prettier-plugin-solidity`
- Success criteria
  - Time-to-first-pass (Track 0, Ex1): < 5 minutes from landing
  - Logs show compiler errors, asserts, events, and basic gas info

### Phase 4 — Content buildout (Tracks 0–4) (7–10 days, concurrent)
- Tracks
  - Track 0: Warmup — state vars, functions, visibility, errors, events (8–10)
  - Track 1: Data & memory — arrays, mappings, structs, enums, storage/memory/calldata (8–10)
  - Track 2: Functions & flow — modifiers, custom errors, overloads (6–8)
  - Track 3: Composition — interfaces, abstract, libraries, using-for, try/catch, low-level calls (6–8)
  - Track 4: ETH basics — payable, receive/fallback, withdrawals, pull pattern (6–8)
- Deliverables
  - 40–50 exercises with starter code and Hardhat tests
  - Authoring CLI (Node JS) to validate exercises: lint, format, run tests, render markdown preview
- Success criteria
  - 90%+ determinism across CI runs
  - Average first-attempt fail rate per exercise between 30–70%

### Phase 5 — Beta, analytics, and polish (5–7 days)
- Beta
  - Onboard 20–50 learners; collect feedback and telemetry
  - Metrics: time-to-first-pass, runs/exercise, hint usage, drop-off per step
- Polish
  - Improve error messages for top failure modes
  - Adjust content difficulty from analytics
- Success criteria
  - Median time-to-first-pass (Track 0) < 6 minutes
  - ≥ 60% learners who pass Track 0 attempt Track 1 within 48 hours
  - ≥ 30% daily return rate during beta week

### Phase 6 — Launch and grant package (3–5 days)
- Launch
  - Public access with quotas and abuse controls
  - Docs: Getting started, How grading works, Writing your first contract
- Grant materials
  - Narrative: lowering time-to-productive Solidity dev with real execution and zero setup
  - Evidence: DAU, solves/user, time-to-first-pass, track progression
- Success criteria
  - Stable infra under 100 concurrent users
  - Grant deck + demo ready

---

## Architecture (JavaScript-only)

- Frontend
  - Next.js (JavaScript), Monaco editor with Solidity language features
  - WebSocket/SSE to stream logs
  - Client linting: `solhint`, formatting: `prettier-plugin-solidity`

- Backend
  - Node.js + Express (JavaScript). Queue with BullMQ (Redis)
  - Docker runner executing Hardhat for compile/tests inside isolated containers
  - Postgres via `pg` or `knex`; simple migration scripts

- Security/abuse
  - Container sandbox (seccomp, read-only FS, no outbound network)
  - Submission quotas + per-IP throttling + captcha on signup

---

## Success metrics (tracked from day 1)
- Learner metrics: time-to-first-pass, attempts-to-pass, hint usage, track progression, retention (D1/D7)
- System metrics: mean job runtime, queue depth, failure rate, cold vs warm run times
- Quality metrics: determinism rate of tests, flaky test count, content NPS

## Go/No-Go gates
- Gate A (end Phase 2): E2E “Hello Solidity” passes via UI in < 10s warm runs
- Gate B (mid Phase 4): 30 exercises stable in CI; 1-click publish flow works
- Gate C (end Phase 5): Beta metrics meet thresholds; infra stable

