import React, { useEffect, useState } from 'react'

export default function Exercises() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState({})

  useEffect(() => {
    fetch('/api/exercises')
      .then(r => r.json())
      .then(setItems)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const key = 'sb:device'
    let deviceId = localStorage.getItem(key)
    if (!deviceId) {
      deviceId = 'dev_' + Math.random().toString(36).slice(2, 10)
      localStorage.setItem(key, deviceId)
    }
    // Load server progress
    fetch(`/api/progress?deviceId=${encodeURIComponent(deviceId)}`)
      .then(r => r.json())
      .then(d => setProgress(d.solved || {}))
      .catch(() => {
        const pg = JSON.parse(localStorage.getItem('sb:progress') || '{}')
        setProgress(pg[deviceId]?.solved || {})
      })
  }, [])

  if (loading) return <div className="panel">Loading…</div>
  if (error) return <div className="panel" style={{ color: 'var(--danger)' }}>{error}</div>

  return (
    <div>
      <h2 style={{ margin: '8px 0 12px 0' }}>Track A — Variables & Basics</h2>
      <div className="list">
        {items.map(x => {
          const solved = progress[x.id]
          return (
            <div key={x.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <a href={`#/exercises/${x.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{x.title}</a>
                {solved && <span className="badge success">solved</span>}
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="chip">{x.difficulty}</span>
                {x.tags?.slice(0, 3).map(t => <span key={t} className="chip">{t}</span>)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

