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

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>
  if (error) return <div style={{ padding: 16, color: 'red' }}>{error}</div>

  return (
    <div style={{ padding: 16 }}>
      <h2>Track A — Variables & Basics</h2>
      <ul>
        {items.map(x => {
          const solved = progress[x.id]
          return (
            <li key={x.id}>
              <a href={`#/exercises/${x.id}`}>{x.title}</a>
              <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>
                [{x.difficulty}] {x.tags?.join(', ')}
              </span>
              {solved && (
                <span style={{ marginLeft: 8, fontSize: 12, color: '#09621a' }}>✓ solved</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

