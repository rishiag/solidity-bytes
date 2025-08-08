# Guardrails for LLM‑Powered Coding Agents

These rules **must** be followed by any agent (Claude, Cursor, etc.) working on this project. Treat every violation as an error and halt until corrected.

---

## 1  Step‑by‑Step Verification Gate

1. After each task, output:

   * **Verification Instructions** – exact commands, URLs, or tests to run.
   * **Pass Criteria** – what output proves success.
2. Wait for my explicit **`/approve`** reply before starting the next task.

## 2  Baseline Protection (Env & Setup Files)

* Any change to `Dockerfile`, `docker-compose*.yml`, `.env*`, `package.json`, `pnpm-lock.yaml`, CI configs, etc. requires:

  1. A **diff preview**.
  2. My **`/approve`** before applying.

## 3  Non‑Destructive Workflow

* Never amend, force‑push, or revert without confirmation.
* Use new commits or a new branch for every change.

## 4  Modular Code

* Place new logic in its own file/module.
* If core libraries must change, explain why in the PR description (“Why this lives here”).

## 5  Secrets Handling

* Request API keys via placeholders (e.g., `process.env.MY_KEY`).
* Never hard‑code actual values in the repo.

## 6  Deviation Procedure

When a change to the agreed plan is required, post a **Change Request** that includes:

1. **Reason**
2. **Impact**
3. **Alternatives considered**
4. **Rollback plan**

Proceed only after **`/approve`**.

---

## Additional Safeguards

### 7  Branch‑per‑Task

* Deliver every feature/fix on a branch named `feat/<slug>` (or `fix/<slug>`). I merge only after tests & verification pass.

### 8  Tests Before Code

* Write or update unit/smoke tests **first**. Implementation follows once tests fail as expected.

### 9  Max‑Retry Policy

* After **two** failed attempts at a pass criterion, pause and request human guidance—no infinite loops.

### 10  Lint & Format Gate

* All code must pass the project’s linter/formatter (`eslint --fix`, `prettier`, etc.) before PR is submitted.

### 11  Structured Commit Messages

* Follow Conventional Commits (`feat: …`, `fix: …`, `chore: …`).

### 12  Dependency Approval

* For any new dependency, provide:

  * Purpose & benefits
  * Size/security trade‑offs
  * Link to documentation
* Await **`/approve`** before adding.

### 13  Telemetry Default‑Off

* Do not add analytics, Sentry, or error‑reporting hooks without explicit approval.

### 14  Timeouts for Long‑Running Commands

* CI and scripts must abort if a command exceeds the configured timeout (set via `CI_TIMEOUT_MIN`, default 15 min).

### 15  Escalation Keyword

* If I type **`#abort`** at any time, stop all activity until I clear it with **`/resume`**.

---

## Slash‑Command Cheat‑Sheet

| Command            | Meaning                                        |
| ------------------ | ---------------------------------------------- |
| `/approve`         | Green‑light to proceed with the proposed step. |
| `/reject`          | Do **not** proceed; revise per feedback.       |
| `/approve --force` | Allow destructive edit (amend/force‑push).     |
| `/abort`           | Immediate halt; await further instruction.     |
| `/resume`          | Continue after an `/abort`.                    |

---

**Follow these guardrails strictly. Do not rely on assumed context—when in doubt, ask.**
