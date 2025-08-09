import React, { useEffect, useState } from 'react'
import { Grid, Card, CardContent, CardActions, Typography, Chip, Alert, Skeleton, Stack, Button, Link as MLink } from '@mui/material'

export default function Exercises() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState({})
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('/api/exercises')
      .then(r => r.json())
      .then(setItems)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    // determine login status
    fetch('/api/auth/me').then(r=>r.json()).then(d=>setUser(d.user||null)).catch(()=>setUser(null))
  }, [])

  useEffect(() => {
    // Load progress based on login status
    const load = async () => {
      try {
        if (user) {
          const r = await fetch('/api/me/progress')
          const d = await r.json()
          setProgress(d.solved || {})
          return
        }
      } catch {}
      const key = 'sb:device'
      let deviceId = localStorage.getItem(key)
      if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).slice(2, 10)
        localStorage.setItem(key, deviceId)
      }
      try {
        const r2 = await fetch(`/api/progress?deviceId=${encodeURIComponent(deviceId)}`)
        const d2 = await r2.json()
        setProgress(d2.solved || {})
      } catch {
        const pg = JSON.parse(localStorage.getItem('sb:progress') || '{}')
        setProgress(pg[deviceId]?.solved || {})
      }
    }
    load()
  }, [user])

  if (loading) return <Skeleton variant="rectangular" height={40} sx={{ my: 2 }} />
  if (error) return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>

  return (
    <div>
      <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>Track A — Variables & Basics</Typography>
      <Grid container spacing={2} alignItems="stretch">
        {items.map(x => {
          const solved = progress[x.id]
          return (
            <Grid item xs={12} sm={6} md={4} key={x.id} sx={{ display: 'flex' }}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                    <MLink href={`#/exercises/${x.id}`} underline="hover" color="primary" sx={{ fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {x.title}
                    </MLink>
                    {solved && <Chip size="small" label="solved" color="success" />}
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                    <Chip size="small" label={x.difficulty} />
                    {x.tags?.slice(0, 3).map(t => <Chip key={t} size="small" label={t} />)}
                  </Stack>
                </CardContent>
                <CardActions sx={{ pt: 0, mt: 'auto', justifyContent: 'flex-end' }}>
                  <Button size="small" href={`#/exercises/${x.id}`}>Open</Button>
                </CardActions>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </div>
  )
}

