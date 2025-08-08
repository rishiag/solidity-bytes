## Soliditybytes

Mission: Help developers learn Solidity quickly through hands-on, zero-setup exercises that run against a real local blockchain. Entire stack will be JavaScript-only.

### What learners can do (MVP)
- Solve curated Solidity exercises in the browser (editor + tests)
- Run tests against an ephemeral local chain and see real output (logs, events, gas)
- Use hints and view reference solutions (gated)
- Track progress across tracks with streaks/XP
- No installs, no wallets, no testnets required

### Project docs
- Plan: `docs/PLAN.md` — detailed phases, milestones, success criteria, scope, architecture
- Tasks: `docs/TASKS.md` — step-by-step checklists we will execute

### Tech decisions (MVP)
- JavaScript-only (no TypeScript)
- Hardhat runner in Docker for compile/tests
- Backend: Node.js + Express + job queue
- Frontend: Next.js (JavaScript) + Monaco editor

### Status
Planning-in-repo complete. Build will follow the tasks in `docs/TASKS.md`.

