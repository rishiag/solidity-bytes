import React, { useEffect, useMemo, useRef, useState } from 'react'

export default function Exercise({ id }) {
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState(null)
  const [subId, setSubId] = useState(null)
  const [log, setLog] = useState('')
  const [running, setRunning] = useState(false)

  useEffect(() => {
    fetch(`/api/exercises/${id}`)
      .then(r => r.json())
      .then(setMeta)
      .catch(e => setError(String(e)))
  }, [id])

  const run = async (mode) => {
    setRunning(true)
    setLog('')
    try {
      const r = await fetch('/api/submissions', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, mode })
      })
      const j = await r.json()
      setSubId(j.submissionId)
      const es = new EventSource(`/api/submissions/${j.submissionId}/stream`)
      es.addEventListener('log', (ev) => {
        const d = JSON.parse(ev.data)
        setLog(x => x + d.chunk)
      })
      es.addEventListener('done', (ev) => {
        const d = JSON.parse(ev.data)
        setLog(x => x + `\n\n[exit code ${d.code}]`)
        es.close()
        setRunning(false)
      })
    } catch (e) {
      setError(String(e))
      setRunning(false)
    }
  }

  if (error) return <div style={{ padding: 16, color: 'red' }}>{error}</div>
  if (!meta) return <div style={{ padding: 16 }}>Loading…</div>

  return (
    <div style={{ padding: 16 }}>
      <a href="#/">← Back</a>
      <h2>{meta.title}</h2>
      <p style={{ whiteSpace: 'pre-wrap' }}>{meta.description}</p>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => run('starter')} disabled={running}>
          Run (starter)
        </button>
        <button onClick={() => run('solution')} style={{ marginLeft: 8 }} disabled={running}>
          Run (solution)
        </button>
      </div>
      <pre style={{ background: '#111', color: '#0f0', padding: 12, height: 320, overflow: 'auto' }}>{log || 'Logs will appear here…'}</pre>
    </div>
  )
}

