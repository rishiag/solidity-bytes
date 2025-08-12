## Security measures (runner + API)

Scope: safely execute untrusted learner code while keeping MVP fast.

### Immediate (do now)
- Whitelist file writes
  - Allow overrides only for starter-listed paths
  - Reject absolute paths, `..`, and symlinks
  - Cap per-file size (e.g., 64–256KB) and total overrides size; limit number of files
- Least-privilege runtime
  - Run test/anvil processes as an unprivileged OS user; never root
  - Bind Anvil to `127.0.0.1`; do not expose to LAN
- Resource limits and kill switches
  - Keep per-run time limits; watchdog for “no output” (e.g., 45s idle)
  - Cap logs (already ~200KB)
- Block network egress
  - No outbound network for job processes (env/proxy stripping; later OS-level egress block)
- Rate limiting and quotas
  - Per-IP and per-user: runs per minute/day; concurrent job cap; queue length cap
- Pin toolchain
  - Pin Hardhat/solc; prebaked node_modules; no lifecycle scripts
- Cookies/sessions
  - `httpOnly`, `sameSite`, `secure` (on https), strong `SESSION_SECRET`; file-store path `.data/sessions` mode 700

### Short term (1–2 days)
- Dedicated runner user
  - Spawn child processes with runner uid/gid; workspace ownership limited to runner
- Harden file store and env
  - `.data/sessions` 700; exclude from backups
  - Pass a minimal env whitelist to child procs: `RPC_URL`, `RUN_OVERRIDES` only
- Exercise schema validation
  - Validate YAML on boot; reject unknown keys and huge payloads
- Backpressure & admission control
  - If pool busy, return “busy, retry shortly”; avoid spawning uncontrolled children

### Medium term (strong isolation)
- Sandbox per job (preferred order)
  1) Docker/Podman with: read-only rootfs, tmpfs `/tmp`, `no-new-privileges`, seccomp, drop caps, pids/mem/cpu limits, `--network=none`
  2) nsjail/firejail if containers not available
- OS egress block for runner user or container (iptables)
- Observability
  - Correlate `submissionId` across API/worker/container logs
  - Metrics: queue depth, wait time, run duration, success rate
  - Alerts on repeated timeouts or OOMs

### Project-specific hardening (apply in code)
- Anvil pool
  - Start with `anvil --host 127.0.0.1 --port <p> --silent`
  - Reset on release using `anvil_reset`; if unhealthy, restart process
- Overrides validator
  - Accept only files from `starter.files.path`
  - Enforce: UTF-8, text only; size/count caps; strip `\r\0` control chars
  - Refuse symlinks by resolving paths under workspace root
- Minimal spawn env
  - `{ RPC_URL, RUN_OVERRIDES }` only; unset proxies/creds/tokens
- Job watchdog
  - Abort if no stdout/stderr for N seconds; emit helpful message

### Operational controls
- Logging
  - Prefix streams (Test/Anvil) for clarity; redact secrets
- Cleanup
  - Scheduled cleanup of `.runner/workspaces/*` older than X days; cap total disk usage
- Backups
  - Exclude `.data/sessions` and temp workspaces; or encrypt backups

### Upgrade path
- Start with current per-exercise cached workspace + Anvil pool
- Add OS-level sandbox (Docker) when concurrency or threat model requires it
- Migrate sessions to Redis if running multiple API instances

### Checklist (MVP)
- [ ] Path whitelist and size caps for overrides
- [ ] Runner uid/gid; Anvil bound to localhost
- [ ] Minimal env for child processes
- [ ] Rate limits and concurrent job cap
- [ ] Watchdog for idle output; informative errors
- [ ] File-based sessions directory 700; strong `SESSION_SECRET`
