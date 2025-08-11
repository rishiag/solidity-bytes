## LeetCode-style Exercise Screen — Design Handoff Guide

Use any of the options below to share your design; the first two are fastest to implement.

### Preferred
- **Figma link**
  - Share a view-only link with comments enabled.
  - Include desktop, tablet, and mobile variants if possible.
  - Note spacing, typography, and color tokens in a side panel or a separate page.
  - Export any custom icons/assets as SVG.

- **Annotated screenshots**
  - Mark up PNG/JPEGs with numbered callouts.
  - Add a numbered list describing each callout’s behavior and states.

### Text spec template (copy/paste and fill in)
- **Layout**
  - Desktop split (e.g., left: Problem/Hints, right: Editor/Logs; ratio 40/60 or 35/65).
  - Sticky elements (breadcrumbs, run/status bar): what stays pinned and where.
  - Breakpoints: exact widths for layout switches (e.g., ≥1200px desktop, 900–1199px tablet, <900px mobile).

- **Panels**
  - Problem: title, tags, difficulty, description formatting (markdown, code blocks, lists).
  - Hints: location (inline/accordion/tab), default state (collapsed/expanded), max height.
  - Editor: tabbed files vs stacked, default height, font size, wrap, minimap.
  - Logs: tab or split view, auto-scroll, copy/clear placement.

- **Run bar**
  - Buttons shown, order, sizes, and variants.
  - Status indicators: pass/fail chip, summary text (e.g., “3 passed, 1 failed”).
  - Progress: linear bar vs spinner; placement.

- **Interactions**
  - Keyboard shortcuts (e.g., Cmd/Ctrl+Enter to run).
  - Tab switching, collapsible sections, focus states.
  - Behavior on navigation during a run (confirm or auto-cancel).

- **Visuals**
  - Spacing scale (e.g., 4/8/12/16 px), corner radius, shadows.
  - Typography scale (caption, body2, body1, h6), weights.
  - Color tokens (primary/secondary, surface, border, success/error/info) with hex values.

- **States**
  - Loading, empty, error, long logs, many files, failing tests list.
  - Auth-gated solution link states.

- **Assets**
  - Icons/illustrations: provide SVGs.
  - Place final assets under `frontend/public/` and reference desired filenames.

- **Deliverables**
  - What to change first vs later (MVP vs polish).
  - Any animation or micro-interactions.

### What I’ll modify
- Structure and UI in `frontend/src/pages/Exercise.jsx` (and small components if needed).
- Styles using the existing Material UI theme for consistency.
- Responsive behavior per your breakpoints.

### Optional (Design tokens)
Provide a short token list to ensure consistency; I’ll map these into the MUI theme if needed.

```text
Colors: primary, secondary, surface, border, success, error (hex)
Spacing: 4, 8, 12, 16, 24
Radii: 4, 8
Typography: caption, body2, body1, h6 (sizes/weights)
```

