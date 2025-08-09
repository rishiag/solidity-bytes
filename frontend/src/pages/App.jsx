import React, { useEffect, useState } from 'react'
import { AppBar, Toolbar, Container as MContainer, Typography, Button, Link as MLink, Box, Stack, Avatar } from '@mui/material'
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
    <AppBar position="sticky" elevation={0} color="default" sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        <MContainer maxWidth="lg" sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="a" href="#/" sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 700 }}>
            Soliditybytes
          </Typography>
          <Stack direction="row" spacing={2} sx={{ ml: 3 }}>
            <MLink href="#/" underline="none">Exercises</MLink>
            <MLink href="https://soliditylang.org/" underline="none" target="_blank" rel="noreferrer">Docs</MLink>
          </Stack>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {user ? (
              <>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar alt={user.name || user.email} src={user.picture} sx={{ width: 28, height: 28 }} />
                  <Typography variant="body2" color="text.secondary" noWrap maxWidth={160} title={user.email}>
                    {user.name || user.email}
                  </Typography>
                </Stack>
                <form method="POST" action="/api/auth/logout" style={{ display: 'inline' }}>
                  <Button size="small" variant="outlined" type="submit">Logout</Button>
                </form>
              </>
            ) : (
              <Button size="small" variant="contained" href="/api/auth/google/start">Login with Google</Button>
            )}
          </Box>
        </MContainer>
      </Toolbar>
    </AppBar>
  )

  const Container = ({ children }) => <MContainer maxWidth="lg" sx={{ py: 3 }}>{children}</MContainer>

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

