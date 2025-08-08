import React, { useEffect, useState } from 'react'
import Exercises from './Exercises.jsx'
import Exercise from './Exercise.jsx'

export default function App() {
  const [route, setRoute] = useState(window.location.hash.replace('#', '') || '/')
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace('#', '') || '/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const Header = () => (
    <div className="header">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <a href="#/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>Soliditybytes</a>
        <div style={{ display: 'flex', gap: 12 }}>
          <a className="chip" href="#/">Exercises</a>
          <a className="chip" href="https://soliditylang.org/" target="_blank" rel="noreferrer">Docs</a>
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

