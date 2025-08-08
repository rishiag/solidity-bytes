import React, { useEffect, useState } from 'react'

export default function Exercises() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/exercises')
      .then(r => r.json())
      .then(setItems)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>
  if (error) return <div style={{ padding: 16, color: 'red' }}>{error}</div>

  return (
    <div style={{ padding: 16 }}>
      <h2>Track A — Variables & Basics</h2>
      <ul>
        {items.map(x => (
          <li key={x.id}>
            <a href={`#/exercises/${x.id}`}>{x.title}</a>
            <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>
              [{x.difficulty}] {x.tags?.join(', ')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

