## QA Study Plan for Solidity Bytes (Frontend + Backend)

This document enumerates the end-to-end test scope, happy paths, edge cases, and likely failure modes. It covers the frontend (Vite + React + Material UI), the backend (Express), the exercise runner (Hardhat subprocess), authentication (Google OAuth), progress storage, and solution gating.

### 0) Pre-requisites and Environments
- **Local dev**: Frontend on 3000, backend on 3001, proxy set to backend. Verify `.env` contents for OAuth and cookie config.
- **Prod-like**: Single origin with reverse proxy serving frontend and proxying `/api` to backend. Secure cookies when `PUBLIC_BASE_URL` is https.
- **Browsers**: Chrome latest, Firefox latest, Safari latest. Private/incognito mode tests for cookies.
- **Network conditions**: Normal, slow 3G (throttle), offline (frontend and API separately).

---

### 1) Authentication and Session
- **Happy path (Google login)**
  - Click login → Google OAuth start (`/api/auth/google/start`) → callback → redirected back; `req.session` has `user`.
  - `GET /api/auth/me` returns `user` object; UI shows avatar/name and logout button.
- **Logout**
  - POST `/api/auth/logout` clears session; UI returns to logged-out state.
- **Edge cases**
  - Cancel OAuth consent midway; ensure app recovers (no partial session).
  - OAuth callback error from Google; backend returns 4xx/5xx → UI shows error state; no partial login.
  - Third-party cookies off (Safari ITP) → confirm session persists via same-site cookie settings.
  - Cookie flags: `sameSite`/`secure` toggle correctly based on `PUBLIC_BASE_URL` protocol; verify cookie presence in dev vs https.
  - Session fixation/regeneration on login; confirm session id changes on authentication.

---

### 2) Exercises Listing (`GET /api/exercises`)
- **Happy path**
  - List loads; each card shows title, difficulty, up to 3 tags.
  - Solved badge visible for solved exercises when logged in; when logged out still reflects device progress.
- **Edge cases**
  - Empty list (server returns `[]`).
  - API returns error/500 → UI `Alert` visible.
  - Slow API response → `Skeleton` visible until resolve.
  - Very long titles/tags/difficulty labels; ensure wrapping and equal card heights.
  - Large list (1000+) → scrolling performance, card virtualization decisions (future).

---

### 3) Exercise Detail (`GET /api/exercises/:id`)
- **Happy path**
  - Metadata loads: title, description, difficulty, tags, hints.
  - Starter files rendered with Monaco editors; edits persist to `localStorage`.
  - Sticky run bar with actions and status chips.
- **Edge cases**
  - Invalid `id` → backend 404; UI shows error `Alert`.
  - Exercise with 0 files (metadata only) → UI stable.
  - Large starter file content → editor performance, scroll.
  - Special characters in description/hints (quotes, markdown-like) → safe render.
  - `localStorage` denied/unavailable (private mode caps) → graceful fallback (no crash).

---

### 4) Runner: Submissions and Streaming Logs
- **Submit run (starter)**: `POST /api/submissions` with `id`, `mode=starter`, `overrides` (from edited code when present), `deviceId`.
- **SSE stream**: `GET /api/submissions/:submissionId/stream` emits `log` and `done` events.
- **Happy path**
  - Clicking Run (starter) clears old logs, disables buttons while running, streams logs, shows final exit code, parses Mocha summary, shows snackbar success/failure.
  - Clicking Run (solution) uses embedded solution and provides pass results.
- **Edge cases**
  - Runner timeout (60s) → backend terminates child; frontend shows failure status and logs indicate timeout.
  - Max log size cap (~200KB) enforced; stream truncates with indicator; frontend remains stable.
  - SSE keepalive ping (~15s) working; long runs keep connection alive; browser doesn’t time out.
  - Client navigates away mid-run; server cleans up process; no orphaned child processes.
  - Multiple rapid runs queued; ensure previous stream closed before next; buttons state correct.
  - Hardhat errors (compilation, config) bubble to logs; frontend doesn’t crash.
  - Malformed overrides (binary data, very long lines) safely handled/logged.

---

### 5) Solution Gating (`GET /api/exercises/:id/solution`)
- **Happy path**
  - Logged-in user who has passed the exercise can fetch solution archive or files (according to current implementation).
- **Edge cases**
  - Logged-in but not passed → 403/401; UI should surface a helpful message.
  - Logged-out → redirect or 401; link in UI should still be visible but leads to auth or error.
  - Visibility rules in YAML respected (if present in metadata).

---

### 6) Progress Tracking
- **Logged-in user (`GET /api/me/progress`)**
  - After passing an exercise, progress persists on server against `user.id`.
  - Refreshing page shows solved badge on listing and resolved gate for solution.
- **Anonymous device**
  - Device id persisted in `localStorage` (`sb:device`).
  - Local progress cache `sb:progress` updated on pass and reflected in UI badges.
- **Migration**
  - After login, `POST /api/me/progress/migrate` merges device progress into user progress; duplicates handled idempotently.
- **Edge cases**
  - Corrupted `sb:progress` JSON → parsing fallback; no crash.
  - Clearing storage mid-session → app regenerates device id; behavior documented.

---

### 7) CORS, Cookies, and Security Headers
- **CORS**
  - `FRONTEND_ORIGIN` allowlist respected in dev and prod; preflight succeeds for POST/SSE.
- **Cookies**
  - `secure` and `sameSite` tuned by `PUBLIC_BASE_URL` protocol; confirm in dev (http) and prod (https).
  - Session cookie scoped to backend origin; persists across refreshes.
- **Headers**
  - Ensure `cache-control` appropriate for API; no sensitive data cached.
  - Check `X-Content-Type-Options: nosniff` and similar hardening (if added later).

---

### 8) Error Handling and Resilience
- **Frontend**
  - All API failures surface Alerts; UI stays navigable.
  - SSE disconnects (server restart, network blips) → handled gracefully (no uncaught exceptions).
  - JSON parse errors from endpoints; defensive code paths.
- **Backend**
  - Unhandled exceptions → sanitized error; no stack traces leaked in prod.
  - File system errors (temp project create, permissions, disk full) → clear logs and 5xx with guidance.
  - YAML parse errors in exercise definitions caught by validator; 4xx/5xx as appropriate.

---

### 9) Content Validation (Track A)
- **Schema conformance**: YAMLs match `docs/exercise.schema.json`.
- **E2E validation**: `scripts/validate-exercises.js` runs each exercise in solution mode; all pass under timeouts.
- **Edge cases**
  - Individual exercise with missing `solution` or missing `starter` file in metadata → runner fails clearly.

---

### 10) UI/UX Consistency (Material UI)
- **Global**: `ThemeProvider` and `CssBaseline` applied; palette/typography visible.
- **Header**: `AppBar` responsive; links and avatar render; focus states visible; keyboard navigation works.
- **Exercises**: Grid alignment; equal-height cards; long titles clamped to 2 lines; tags wrap; Open action consistent.
- **Exercise detail**: Sticky run bar doesn’t overlap content; two-column layout collapses to one on mobile; editor panels sized and scroll correctly; logs readable with copy/clear.
- **Snackbar**: Success/failure appears bottom-center, auto hides; accessible (aria-live implied by Alert).

---

### 11) Accessibility
- Tab order sensible (header → list → cards → actions → content).
- Visible focus outlines on links/buttons.
- Contrast checks on primary/secondary colors (AA/AAA where feasible).
- ARIA: Snackbar/Alert semantics correct; images (avatar) have alt.

---

### 12) Performance & Stability
- **Frontend**
  - Initial load time; ensure no large unused bundles.
  - Editor lazy behavior acceptable; no jank when typing.
- **Backend**
  - Concurrency: multiple runs in parallel from different users; no shared temp collisions.
  - Process cleanup: no zombie `node`/`hardhat` processes after runs; temp dirs removed.

---

### 13) Security & Privacy (Baseline)
- No secrets in client bundles.
- OAuth tokens not logged; PII minimized in logs.
- Input handling for `overrides` sanitized for path traversal; only whitelisted files allowed.
- Archive/solution retrieval does not allow arbitrary file read.

---

### 14) Build, CI, and Deployability
- **Build**: `frontend` build succeeds; backend starts with `.env` loaded; ports configurable.
- **Validate content**: `npm run validate:track-a` passes.
- **Docs**: README run sections accurate; environment variable descriptions up to date.

---

### 15) Test Data and Fixtures
- Test Google users (at least two) for different states (new user, existing with progress).
- A device-only flow without login to ensure migration path.
- Exercises with intentional failure to test logs and summary parsing.

---

### 16) Prioritized Happy Paths (Smoke Suite)
1. Load exercises list (logged out) → open an exercise → run starter (fail) → view logs.
2. Login with Google → run starter again (fail) → run solution (pass) → see snackbar success.
3. Return to list → solved badge visible → solution link accessible.
4. Logout → device progress still shows solved badges for that device.

---

### 17) Notable Risk Areas
- OAuth/cookie misconfiguration between http/https origins.
- Runner timeouts and stream truncation behavior across browsers.
- Progress merge conflicts (device → user) and idempotency.
- Large content rendering in Monaco causing layout shifts.
- Grid alignment and responsiveness across many screen sizes.

---

### 18) Future Automation Hooks
- API tests for auth/progress/submissions using supertest.
- Frontend smoke tests with Playwright (login via test users, run flow, verify solution gating).
- Content validation in CI for all YAML exercises.

