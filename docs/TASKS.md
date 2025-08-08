## Soliditybytes — Actionable task checklist (JS-only)

Use this checklist to execute the MVP plan. Keep it updated as tasks complete.

### Phase 0 — Product definition and content spec
- [ ] Draft track map and learning outcomes (Tracks 0–4)
- [x] Define `exercise.schema.json`
- [x] Write author style guide
- [ ] Draft 30 exercise YAMLs (titles, objectives, hints, acceptance)
- [ ] Low-fidelity wireframes: problem page, progress page

### Phase 1 — Runner spike (Hardhat in Docker)
- [ ] Create Dockerfile (Node LTS + Hardhat + solc versions)
- [ ] Scaffold minimal Hardhat project template (JS)
- [ ] Implement runner script to mount submission and run `hardhat test`
- [ ] Enforce limits: CPU, memory, 60s timeout, no network egress
- [ ] Seed starter exercise with passing tests
- [ ] Measure cold/warm run times

### Phase 2 — Backend API and jobs
- [ ] Initialize Node.js Express app (JS)
- [ ] Auth (email/Discord OAuth) + JWT sessions
- [ ] Redis + BullMQ for job queue
- [ ] Postgres schema: users, exercises, submissions, results, progress, rate_limits
- [ ] Endpoints: list/get exercises, submit, stream logs, results, progress
- [ ] Worker: Docker run per submission with timeouts; capture logs/events/gas
- [ ] Rate limiting (per-user, per-IP) and quotas
- [ ] Admin route to publish/revise exercises

### Phase 3 — Frontend MVP (Next.js, JS)
- [ ] Next.js app scaffold (JS)
- [ ] Auth UI and session management
- [ ] Problem page with Monaco editor, Run Tests button, terminal for logs
- [ ] Hint/solution gating UI
- [ ] Progress page with solved/attempted and track view
- [ ] Explore page with filters
- [ ] Client linting (`solhint`) and formatting (`prettier-plugin-solidity`)

### Phase 4 — Content buildout (Tracks 0–4)
- [ ] Implement authoring CLI (validate, format, test, render markdown)
- [ ] Track 0: 8–10 exercises complete with tests
- [ ] Track 1: 8–10 exercises complete with tests
- [ ] Track 2: 6–8 exercises complete with tests
- [ ] Track 3: 6–8 exercises complete with tests
- [ ] Track 4: 6–8 exercises complete with tests
- [ ] CI determinism check; adjust flaky tests

### Phase 5 — Beta, analytics, polish
- [ ] Add telemetry (frontend + backend)
- [ ] Onboard 20–50 learners
- [ ] Improve error messages for top failure modes
- [ ] Tune exercise difficulty based on metrics

### Phase 6 — Launch + grant package
- [ ] Abuse controls: captchas, quotas, rate limits verified
- [ ] Public docs: Getting started, How grading works
- [ ] Stability test under 100 concurrent users
- [ ] Prepare grant deck + demo

