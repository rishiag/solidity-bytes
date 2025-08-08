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
        // cache progress client-side for now, server sync is already persisted
        try {
          const key = 'sb:device'
          const dev = localStorage.getItem(key) || deviceId
          const pgKey = 'sb:progress'
          const db = JSON.parse(localStorage.getItem(pgKey) || '{}')
          db[dev] = db[dev] || { solved: {} }
          if (d.code === 0) db[dev].solved[id] = true
          localStorage.setItem(pgKey, JSON.stringify(db))
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

  if (error) return <div style={{ padding: 16, color: 'red' }}>{error}</div>
  if (!meta) return <div style={{ padding: 16 }}>Loading…</div>

  return (
    <div style={{ padding: 16 }}>
      <a href="#/">← Back</a>
      <h2>{meta.title}</h2>
      <p style={{ whiteSpace: 'pre-wrap' }}>{meta.description}</p>
      {exitCode !== null && (
        <div style={{
          display: 'inline-block',
          padding: '4px 8px',
          borderRadius: 6,
          background: exitCode === 0 ? '#e6ffed' : '#ffe6e6',
          color: exitCode === 0 ? '#09621a' : '#8a0000',
          marginBottom: 12
        }}>
          {exitCode === 0 ? 'Passed' : 'Failed'}
        </div>
      )}
      {meta.starter?.files?.map(f => (
        <div key={f.path} style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: 'monospace' }}>{f.path}</div>
          <div style={{ border: '1px solid #ddd' }}>
            <Editor
              height="220px"
              defaultLanguage={f.path.endsWith('.sol') ? 'plaintext' : 'javascript'}
              value={edited[f.path] ?? f.content}
              onChange={(v) => setEdited(prev => ({ ...prev, [f.path]: v ?? '' }))}
              options={{ minimap: { enabled: false }, fontSize: 14 }}
            />
          </div>
        </div>
      ))}
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => run('starter')} disabled={running}>
          Run (starter)
        </button>
        <button onClick={() => run('solution')} style={{ marginLeft: 8 }} disabled={running}>
          Run (solution)
        </button>
        <a href={`#/`} style={{ marginLeft: 12, fontSize: 12 }}>refresh list</a>
        <a href={`/api/exercises/${id}/solution`} target="_blank" rel="noreferrer" style={{ marginLeft: 12, fontSize: 12 }}>
          view solution files
        </a>
      </div>
      <pre style={{ background: '#111', color: '#0f0', padding: 12, height: 320, overflow: 'auto' }}>{log || 'Logs will appear here…'}</pre>
    </div>
  )
}

