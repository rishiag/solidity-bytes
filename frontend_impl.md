## Frontend UI Implementation Plan (Material UI)

Scope: Improve the UI for both pages — `Exercises` list and single `Exercise` — using Material UI (MUI), without changing business logic or APIs. We will proceed step-by-step; after each step you will visually verify in the browser before we continue.

### Baseline
- Library: `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` (installed)
- Entry point: `frontend/src/main.jsx`
- Pages: `frontend/src/pages/App.jsx`, `frontend/src/pages/Exercises.jsx`, `frontend/src/pages/Exercise.jsx`

---

### Step 1 — Wire up MUI providers
- Goal: Ensure the app is wrapped with `ThemeProvider` and `CssBaseline` so MUI styles render consistently.
- Edits: `src/main.jsx`
- Components: `ThemeProvider`, `CssBaseline`, `createTheme`
- Acceptance:
  - Page renders without errors.
  - Default MUI typography and spacing visible (slight font/spacing change).

### Step 2 — Global layout header with MUI
- Goal: Replace the current inline-styled header with MUI `AppBar` + `Toolbar`.
- Edits: `src/pages/App.jsx`
- Components: `AppBar`, `Toolbar`, `Container`, `Typography`, `Button`, `Avatar`, `Link`, `Box`.
- Acceptance:
  - Sticky top bar, brand at left, nav links, auth controls at right.
  - Layout responsive to width changes.

### Step 3 — Exercises page: Cards grid
- Goal: Replace raw HTML with MUI layout and present exercises as cards.
- Edits: `src/pages/Exercises.jsx`
- Components: `Container`, `Grid`, `Card`, `CardContent`, `CardActions`, `Chip`, `Alert`, `Skeleton`, `Link`, `Stack`.
- Acceptance:
  - Loading uses `Skeleton`.
  - Errors show `Alert`.
  - Cards display title, difficulty chip, tag chips, and a “Open” action.

### Step 4 — Exercise page: Run bar and two-column layout
- Goal: Create a clear run bar and split layout for problem vs editor.
- Edits: `src/pages/Exercise.jsx`
- Components: `Container`, `Paper`, `Stack`, `Button`, `Chip`, `Grid`, `Typography`, `Divider`.
- Acceptance:
  - Sticky run bar with `Run (starter)` and `Run (solution)` buttons.
  - Left column: title, difficulty/tags, description, hints.
  - Right column: editor tabs + Monaco editor, file path label.

### Step 5 — Logs panel styling
- Goal: Make logs easier to scan and readable on both themes.
- Edits: `src/pages/Exercise.jsx`
- Components: `Paper`, `Typography`, `Box`.
- Acceptance:
  - Monospace logs with proper padding, wrapping, and scroll.

### Step 6 — Feedback via Snackbar
- Goal: Show pass/fail feedback with MUI `Snackbar` + `Alert`.
- Edits: `src/pages/Exercise.jsx`
- Components: `Snackbar`, `Alert`.
- Acceptance:
  - On run complete, show success/failure snackbar.

### Step 7 — Responsive polish
- Goal: Ensure small screens stack columns; refine paddings/margins.
- Edits: `src/pages/Exercises.jsx`, `src/pages/Exercise.jsx`
- Components: Use Grid breakpoints and responsive props.
- Acceptance:
  - Comfortable on mobile and desktop.

### Step 8 — Theme accents
- Goal: Configure a minimal brand theme (primary color) and typography scale.
- Edits: `src/main.jsx`
- Components: `createTheme` palette + typography.
- Acceptance:
  - Primary color applied to header/action buttons.

### Step 9 — Small UX touches
- Goal: Add progress indicators, chips, and back-link improvements.
- Edits: `src/pages/Exercises.jsx`, `src/pages/Exercise.jsx`
- Components: `Chip`, `Breadcrumbs`, `LinearProgress`.
- Acceptance:
  - Clear solved-state indicator and navigation affordances.

### Step 10 — Cleanup and docs
- Goal: Remove dead styles, document component usage.
- Edits: code cleanup comments and `README` UI section (optional).
- Acceptance:
  - No unused imports, tidy structure.

Status: Completed. Removed unused React imports in `Exercise.jsx` and eliminated the unused `subId` state; simplified the SSE wiring to use `j.submissionId` directly.

---

Process: After each step, I will post a short note of exactly what changed for you to verify visually. Once confirmed, I’ll proceed to the next step.

