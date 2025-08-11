import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { AppBar, Toolbar, Container as MContainer, Typography, Button, Link as MLink, Box, Stack, Avatar, Menu, MenuItem } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Exercises from './Exercises.jsx'
import Exercise from './Exercise.jsx'
import NotFound from './NotFound.jsx'

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
            Solidity Bytes
          </Typography>
          <Stack direction="row" spacing={2} sx={{ ml: 3, alignItems: 'center' }}>
            <MLink href="#/" underline="none" sx={{
              display: 'inline-flex', alignItems: 'center', fontSize: 14, color: 'text.primary',
              '&:hover': { color: 'primary.main', textDecoration: 'none' }
            }}>Exercises</MLink>
            {(() => {
              const [anchorEl, setAnchorEl] = React.useState(null)
              const open = Boolean(anchorEl)
              const handleOpen = (e) => setAnchorEl(e.currentTarget)
              const handleClose = () => setAnchorEl(null)
              return (
                <>
                  <Button size="small" onClick={handleOpen} endIcon={<ExpandMoreIcon fontSize="small" />} sx={{
                    fontSize: 14, textTransform: 'none', color: 'text.primary',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}>Get Help</Button>
                  <Menu anchorEl={anchorEl} open={open} onClose={handleClose} keepMounted>
                    <MenuItem component="a" href="https://soliditylang.org/" target="_blank" rel="noreferrer" onClick={handleClose}>
                      Solidity Docs
                    </MenuItem>
                  </Menu>
                </>
              )
            })()}
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

  const Footer = () => (
    <Box component="footer" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 1.25, mt: 'auto' }}>
      <MContainer maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: 'inherit' }}>© {new Date().getFullYear()} Solidity Bytes</Typography>
      </MContainer>
    </Box>
  )

  const Container = ({ children }) => (
    <MContainer maxWidth={false} disableGutters sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
      {children}
    </MContainer>
  )

  if (route.startsWith('/exercises/')) {
    // Normalize id to the first segment only (handles paths like "/#/exercises/basic-enum/extra")
    const id = route.split('/exercises/')[1].split('/')[0]
    const humanizedId = id
      .split('-')
      .filter(Boolean)
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ')
    return (
      <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <Helmet>
          <title>{`${humanizedId} - Solidity Bytes`}</title>
          <link rel="canonical" href={`https://soliditybytes.com/#/exercises/${id}`} />
        </Helmet>
        <Header />
        <Container>
          <Exercise id={id} />
        </Container>
        <Footer />
      </Box>
    )
  }
  if (route === '/' || route === '') {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <Helmet>
          <title>Solidity Bytes - Learn Solidity by Doing</title>
          <link rel="canonical" href={`https://soliditybytes.com/`} />
        </Helmet>
        <Header />
        <Container>
          <Exercises />
        </Container>
        <Footer />
      </Box>
    )
  }
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container>
        <NotFound />
      </Container>
      <Footer />
    </Box>
  )
}

