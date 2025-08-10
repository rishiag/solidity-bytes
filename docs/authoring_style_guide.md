## Authoring Style Guide — Solidity Bytes

This guide defines how to write exercises that are clear, consistent, and auto-gradable.

### Principles
- Teach one primary concept per exercise. Avoid multi-concept puzzles early on.
- Prefer realistic, minimal examples over contrived code.
- Make acceptance criteria unambiguous; tests must determine pass/fail deterministically.

### Exercise structure (matches `docs/exercise.schema.json`)
- `id`: kebab-case slug (e.g., `arrays-append-and-pop`).
- `title`: descriptive and concise.
- `difficulty`: `beginner` | `intermediate` | `advanced`.
- `tags`: up to 12 topic tags.
- `objectives`: bullet list describing what the learner will practice.
- `description`: markdown; include context, examples, and constraints.
- `hints`: ordered list from light to strong hints.
- `starter.files[]`: one or more files (path + content) the learner starts with.
- `tests.files[]`: one or more files containing Mocha/Chai Hardhat tests (authoritative).
- `solution.files[]`: canonical implementation that passes tests.
- `visibility`: when to reveal the solution: `always` | `after-pass` | `admin-only`.

### Writing good descriptions
- State the goal in 1–2 sentences.
- List constraints (e.g., "use a `mapping(address => uint)`").
- Provide I/O examples if relevant.
- Avoid spoilers; push deeper insights into hints.

### Hints
- Provide 2–4 hints, escalating in specificity.
- Last hint can include a near-solution nudge without revealing full code.

### Tests
- Use Hardhat (JavaScript) with Mocha/Chai.
- Name tests by behavior ("emits Transfer on mint").
- Include positive, negative, and edge cases.
- Ensure determinism (no time/randomness without seeding).
- Fail messages should guide learners (actionable).

### Style and formatting
- Solidity: follow `prettier-plugin-solidity` formatting.
- JS tests: Prettier defaults; avoid magic numbers; use constants.

### Examples
- See `exercises/_examples/` for three sample exercises covering arrays, mappings, and payable/receive.

