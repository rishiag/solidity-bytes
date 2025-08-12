import { spawn } from 'child_process'

/**
 * Very small Anvil worker pool for MVP.
 * - Starts N anvil processes on sequential ports at server boot
 * - acquire() returns an idle worker (or null if none)
 * - release(worker) resets chain state via anvil_reset
 */

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

export class AnvilPool {
  constructor() {
    this.workers = [] // { id, port, url, proc, busy }
    this.started = false
  }

  async init() {
    if (this.started) return
    this.started = true
    const count = Number(process.env.ANVIL_WORKERS || 3)
    const basePort = Number(process.env.ANVIL_BASE_PORT || 8545)
    for (let i = 0; i < count; i++) {
      const port = basePort + i
      const proc = spawn('anvil', ['--port', String(port), '--silent'], {
        stdio: ['ignore', 'ignore', 'inherit']
      })
      const url = `http://127.0.0.1:${port}`
      const worker = { id: `anvil-${i}`, port, url, proc, busy: false }
      this.workers.push(worker)
      // Give anvil a brief moment to boot
      await sleep(150)
    }
  }

  acquire() {
    for (const w of this.workers) {
      if (!w.busy) { w.busy = true; return w }
    }
    return null
  }

  async release(worker) {
    try {
      await fetch(worker.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'anvil_reset', params: [{}] })
      })
    } catch {}
    worker.busy = false
  }
}

const pool = new AnvilPool()
export default pool

