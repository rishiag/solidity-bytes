import React, { useEffect, useState } from 'react'
import Exercises from './Exercises.jsx'
import Exercise from './Exercise.jsx'

export default function App() {
  const [route, setRoute] = useState(window.location.hash.replace('#', '') || '/')
  const [user, setUser] = useState(null)
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace('#', '') || '/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => setUser(d.user || null))
      .catch(() => {})
  }, [])

  const Header = () => (
    <div className="header">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <a href="#/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>Soliditybytes</a>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a className="chip" href="#/">Exercises</a>
          <a className="chip" href="https://soliditylang.org/" target="_blank" rel="noreferrer">Docs</a>
          {user ? (
            <>
              <span className="chip" title={user.email}>{user.name || user.email}</span>
              <form method="POST" action="/api/auth/logout" style={{ display: 'inline' }}>
                <button className="btn secondary" type="submit">Logout</button>
              </form>
            </>
          ) : (
            <a className="btn" href="/api/auth/google/start">Login with Google</a>
          )}
        </div>
      </div>
    </div>
  )

  const Container = ({ children }) => <div className="container">{children}</div>

  if (route.startsWith('/exercises/')) {
    const id = route.split('/exercises/')[1]
    return (
      <>
        <Header />
        <Container>
          <Exercise id={id} />
        </Container>
      </>
    )
  }
  return (
    <>
      <Header />
      <Container>
        <Exercises />
      </Container>
    </>
  )
}

