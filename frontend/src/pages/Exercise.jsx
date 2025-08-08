import React, { useEffect, useMemo, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'

export default function Exercise({ id }) {
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState(null)
  const [subId, setSubId] = useState(null)
  const [log, setLog] = useState('')
  const [running, setRunning] = useState(false)
  const [edited, setEdited] = useState({})
  const [exitCode, setExitCode] = useState(null)
  const [summary, setSummary] = useState(null)
  const [showHints, setShowHints] = useState(false)

  useEffect(() => {
    fetch(`/api/exercises/${id}`)
      .then(r => r.json())
      .then(setMeta)
      .catch(e => setError(String(e)))
  }, [id])

  const run = async (mode) => {
    setRunning(true)
    setLog('')
    setExitCode(null)
    setSummary(null)
    try {
      const overrides = []
      if (mode === 'starter' && meta?.starter?.files?.length) {
        for (const f of meta.starter.files) {
          const editedContent = edited[f.path]
          if (editedContent && typeof editedContent === 'string') {
            overrides.push({ path: f.path, content: editedContent })
          }
        }
      }
      const deviceId = localStorage.getItem('sb:device') || 'dev-local'
      const r = await fetch('/api/submissions', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, mode, overrides: overrides.length ? overrides : undefined, deviceId })
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
        setExitCode(d.code)
        // compute mocha summary from final log
        try {
          const s = parseMochaSummary(log)
          setSummary(s)
        } catch {}
        // cache progress for anonymous users only (server persists for logged-in)
        try {
          const me = await fetch('/api/auth/me').then(r=>r.json()).catch(()=>({}))
          if (!me.user) {
            const key = 'sb:device'
            const dev = localStorage.getItem(key) || deviceId
            const pgKey = 'sb:progress'
            const db = JSON.parse(localStorage.getItem(pgKey) || '{}')
            db[dev] = db[dev] || { solved: {} }
            if (d.code === 0) db[dev].solved[id] = true
            localStorage.setItem(pgKey, JSON.stringify(db))
          }
        } catch {}
      })
    } catch (e) {
      setError(String(e))
      setRunning(false)
    }
  }

  // Load saved code (if any) on mount/meta load
  useEffect(() => {
    if (!meta?.starter?.files) return
    const key = `sb:code:${id}`
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const obj = JSON.parse(saved)
        setEdited(obj)
        return
      } catch {}
    }
    // Initialize with starter contents
    const init = {}
    for (const f of meta.starter.files) init[f.path] = f.content
    setEdited(init)
  }, [id, meta])

  // Persist on edit
  useEffect(() => {
    if (!meta?.starter?.files?.length) return
    const key = `sb:code:${id}`
    localStorage.setItem(key, JSON.stringify(edited))
  }, [edited, id, meta])

  if (error) return <div className="panel" style={{ color: 'var(--danger)' }}>{error}</div>
  if (!meta) return <div className="panel">Loading…</div>

  return (
    <div>
      <div className="sticky">
        <span className="chip mono">{id}</span>
        <button className="btn" onClick={() => run('starter')} disabled={running}>Run (starter)</button>
        <button className="btn secondary" onClick={() => run('solution')} disabled={running}>Run (solution)</button>
        {exitCode !== null && (
          <span className={`badge ${exitCode === 0 ? 'success' : 'danger'}`} style={{ marginLeft: 8 }}>
            {exitCode === 0 ? 'Passed' : 'Failed'}
          </span>
        )}
        {summary && (
          <span className="muted" style={{ marginLeft: 8 }}>
            {summary.passing} passed{typeof summary.failing === 'number' ? `, ${summary.failing} failed` : ''}
          </span>
        )}
        <a href={`#/`} className="chip" style={{ marginLeft: 'auto' }}>Back to list</a>
        <a href={`/api/exercises/${id}/solution`} target="_blank" rel="noreferrer" className="chip" style={{ marginLeft: 8 }}>Solution</a>
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <div className="col">
          <div className="panel">
            <h2 style={{ marginTop: 0 }}>{meta.title}</h2>
            <p className="muted" style={{ marginTop: 4 }}>[{meta.difficulty}] {meta.tags?.join(', ')}</p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{meta.description}</p>
            <div style={{ marginTop: 8 }}>
              <button className="btn secondary" onClick={() => setShowHints(v => !v)}>
                {showHints ? 'Hide hints' : 'Show hints'}
              </button>
              {showHints && (
                <ul style={{ marginTop: 8 }}>
                  {(meta.hints || []).map((h, i) => <li key={i} className="muted">{h}</li>)}
                </ul>
              )}
            </div>
          </div>

          {summary?.failures?.length > 0 && (
            <div className="panel" style={{ marginTop: 12 }}>
              <strong>Failing tests</strong>
              <ul>
                {summary.failures.map((t, i) => <li key={i} style={{ color: 'var(--danger)' }}>{t}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div className="col">
          {meta.starter?.files?.map(f => (
            <div key={f.path} className="panel" style={{ marginBottom: 12 }}>
              <div className="mono" style={{ marginBottom: 6 }}>{f.path}</div>
              <Editor
                height="220px"
                theme="vs-dark"
                defaultLanguage={f.path.endsWith('.sol') ? 'plaintext' : 'javascript'}
                value={edited[f.path] ?? f.content}
                onChange={(v) => setEdited(prev => ({ ...prev, [f.path]: v ?? '' }))}
                options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 12 }}>
        <div className="mono log">{log || 'Logs will appear here…'}</div>
      </div>
    </div>
  )
}

// Very small parser for Mocha CLI output
function parseMochaSummary(fullLog) {
  const text = String(fullLog || '')
  const passingMatch = text.match(/(\d+)\s+passing/)
  const failingMatch = text.match(/(\d+)\s+failing/)
  const failures = []
  const lines = text.split(/\r?\n/)
  for (const ln of lines) {
    // Examples: "  1) Suite name" OR "1) Suite name test name"
    const m = ln.match(/^\s*(\d+)\)\s+(.+)/)
    if (m) failures.push(m[2].trim())
  }
  return {
    passing: passingMatch ? Number(passingMatch[1]) : 0,
    failing: failingMatch ? Number(failingMatch[1]) : (failures.length || 0),
    failures
  }
}

