import React, { useEffect, useState } from 'react'
import { Box, Typography, Stack, Collapse, IconButton, List, ListItemButton, ListItemText, Paper } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import categories from '../data/categories'

export default function Exercises() {
  const [open, setOpen] = useState({})
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const catList = categories

  const toggle = (id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }))

  useEffect(() => {
    fetch('/exercises')
      .then(r => r.json())
      .then(setItems)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 820 }}>
        <Typography variant="h6" sx={{ mt: 1, mb: 2, textAlign: 'center' }}>Learning Tracks</Typography>

        <Stack spacing={1.5}>
          {catList.map((c) => {
            const exercises = (!loading && !error) ? items.filter(it => it.category === c.id) : []
            const hasItems = exercises.length > 0
            const disabled = c.locked || !hasItems
            return (
            <Paper key={c.id} variant="outlined" sx={{ p: 1, bgcolor: 'background.paper', opacity: c.locked ? 0.9 : 1 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                onClick={() => !disabled && toggle(c.id)}
                role="button"
                aria-expanded={!!open[c.id]}
                sx={{ cursor: disabled ? 'default' : 'pointer', userSelect: 'none' }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{c.name}</Typography>
                  {c.locked && (
                    <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>Coming soon</Typography>
                  )}
                </Stack>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); !disabled && toggle(c.id); }} aria-label={open[c.id] ? 'Collapse' : 'Expand'} disabled={disabled}>
                  {open[c.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Stack>
              <Collapse in={!c.locked && hasItems && !!open[c.id]} timeout="auto" unmountOnExit>
                <List dense sx={{ mt: 1 }}>
                  {exercises.map((it) => (
                    <ListItemButton
                      key={it.id}
                      sx={{ pl: 1.5, my: 0.75, border: 1, borderColor: 'divider', borderRadius: 1 }}
                      href={`#/exercises/${it.id}`}
                    >
                      <ListItemText primary={it.title} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </Paper>
            )
          })}
        </Stack>
      </Box>
    </Box>
  )
}

