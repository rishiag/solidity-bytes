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

  if (route.startsWith('/exercises/')) {
    const id = route.split('/exercises/')[1]
    return <Exercise id={id} />
  }
  return <Exercises />
}

