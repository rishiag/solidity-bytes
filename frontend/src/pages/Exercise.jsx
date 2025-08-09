import React, { useEffect, useState } from 'react'
import { Paper, Grid, Stack, Button, Chip, Typography, Alert, Box, Snackbar, Breadcrumbs, Link as MLink, LinearProgress } from '@mui/material'
import Editor from '@monaco-editor/react'

export default function Exercise({ id }) {
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState(null)
  // cleaned: removed unused submission id state
  const [log, setLog] = useState('')
  const [running, setRunning] = useState(false)
  const [edited, setEdited] = useState({})
  const [exitCode, setExitCode] = useState(null)
  const [summary, setSummary] = useState(null)
  const [showHints, setShowHints] = useState(false)
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetch(`/api/exercises/${id}`)
      .then(r => r.json())
      .then(setMeta)
      .catch(e => setError(String(e)))
  }, [id])

  const run = async (mode) => {
    setRunning(true)
    setLog('')
    setExitCode(null)
    setSummary(null)
    try {
      const overrides = []
      if (mode === 'starter' && meta?.starter?.files?.length) {
        for (const f of meta.starter.files) {
          const editedContent = edited[f.path]
          if (editedContent && typeof editedContent === 'string') {
            overrides.push({ path: f.path, content: editedContent })
          }
        }
      }
      const deviceId = localStorage.getItem('sb:device') || 'dev-local'
      const r = await fetch('/api/submissions', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, mode, overrides: overrides.length ? overrides : undefined, deviceId })
      })
      const j = await r.json()
      const es = new EventSource(`/api/submissions/${j.submissionId}/stream`)
      es.addEventListener('log', (ev) => {
        const d = JSON.parse(ev.data)
        setLog(x => x + d.chunk)
      })
      es.addEventListener('done', async (ev) => {
        const d = JSON.parse(ev.data)
        setLog(x => x + `\n\n[exit code ${d.code}]`)
        es.close()
        setRunning(false)
        setExitCode(d.code)
        // compute mocha summary from final log
        try {
          const s = parseMochaSummary(log)
          setSummary(s)
        } catch {}
        // snackbar feedback
        setSnack({ open: true, message: d.code === 0 ? 'All tests passed' : 'Tests failed', severity: d.code === 0 ? 'success' : 'error' })
        // cache progress for anonymous users only (server persists for logged-in)
        try {
          const me = await fetch('/api/auth/me').then(r=>r.json()).catch(()=>({}))
          if (!me.user) {
            const key = 'sb:device'
            const dev = localStorage.getItem(key) || deviceId
            const pgKey = 'sb:progress'
            const db = JSON.parse(localStorage.getItem(pgKey) || '{}')
            db[dev] = db[dev] || { solved: {} }
            if (d.code === 0) db[dev].solved[id] = true
            localStorage.setItem(pgKey, JSON.stringify(db))
          }
        } catch {}
      })
    } catch (e) {
      setError(String(e))
      setRunning(false)
    }
  }

  // Load saved code (if any) on mount/meta load
  useEffect(() => {
    if (!meta?.starter?.files) return
    const key = `sb:code:${id}`
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const obj = JSON.parse(saved)
        setEdited(obj)
        return
      } catch {}
    }
    // Initialize with starter contents
    const init = {}
    for (const f of meta.starter.files) init[f.path] = f.content
    setEdited(init)
  }, [id, meta])

  // Persist on edit
  useEffect(() => {
    if (!meta?.starter?.files?.length) return
    const key = `sb:code:${id}`
    localStorage.setItem(key, JSON.stringify(edited))
  }, [edited, id, meta])

  if (error) return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
  if (!meta) return <Paper variant="outlined" sx={{ p: 2, my: 2 }}>Loading…</Paper>

  return (
    <div>
      <Breadcrumbs sx={{ my: 1 }}>
        <MLink href="#/" underline="hover">Exercises</MLink>
        <Typography color="text.secondary" noWrap maxWidth={480}>{meta.title}</Typography>
      </Breadcrumbs>
      <Paper variant="outlined" sx={{ position: 'sticky', top: 64, zIndex: 5, p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Chip size="small" label={id} variant="outlined" />
        <Button size="small" variant="contained" onClick={() => run('starter')} disabled={running}>Run (starter)</Button>
        <Button size="small" variant="outlined" onClick={() => run('solution')} disabled={running}>Run (solution)</Button>
        {exitCode !== null && (
          <Chip color={exitCode === 0 ? 'success' : 'error'} label={exitCode === 0 ? 'Passed' : 'Failed'} size="small" sx={{ ml: 1 }} />
        )}
        {summary && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {summary.passing} passed{typeof summary.failing === 'number' ? `, ${summary.failing} failed` : ''}
          </Typography>
        )}
        <Button size="small" href={`#/`} sx={{ ml: 'auto' }}>Back to list</Button>
        <Button size="small" href={`/api/exercises/${id}/solution`} target="_blank" rel="noreferrer">Solution</Button>
        {running && (
          <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
            <LinearProgress />
          </Box>
        )}
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mt: 0 }}>{meta.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              [{meta.difficulty}] {meta.tags?.join(', ')}
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{meta.description}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button size="small" variant="outlined" onClick={() => setShowHints(v => !v)}>
                {showHints ? 'Hide hints' : 'Show hints'}
              </Button>
            </Stack>
            {showHints && (
              <Stack component="ul" sx={{ mt: 1, pl: 2 }}>
                {(meta.hints || []).map((h, i) => (
                  <Typography key={i} component="li" variant="body2" color="text.secondary">{h}</Typography>
                ))}
              </Stack>
            )}
          </Paper>

          {summary?.failures?.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle2">Failing tests</Typography>
              <Stack component="ul" sx={{ mt: 1, pl: 2 }}>
                {summary.failures.map((t, i) => (
                  <Typography key={i} component="li" color="error.main">{t}</Typography>
                ))}
              </Stack>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          {meta.starter?.files?.map(f => (
            <Paper key={f.path} variant="outlined" sx={{ p: 1.5, mb: 2 }}>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{f.path}</Typography>
              <Editor
                height="220px"
                theme="vs-dark"
                defaultLanguage={f.path.endsWith('.sol') ? 'plaintext' : 'javascript'}
                value={edited[f.path] ?? f.content}
                onChange={(v) => setEdited(prev => ({ ...prev, [f.path]: v ?? '' }))}
                options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false }}
              />
            </Paper>
          ))}
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 1.5, mt: 2 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Button size="small" variant="outlined" onClick={() => navigator.clipboard.writeText(log || '')} disabled={!log}>Copy</Button>
          <Button size="small" variant="text" onClick={() => setLog('')} disabled={!log}>Clear</Button>
        </Stack>
        <Box component="pre" sx={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          whiteSpace: 'pre-wrap',
          m: 0,
          fontSize: 13,
          lineHeight: 1.55,
          maxHeight: 340,
          overflow: 'auto',
          p: 1,
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
          borderRadius: 1
        }}>
          {log || 'Logs will appear here…'}
        </Box>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

// Very small parser for Mocha CLI output
function parseMochaSummary(fullLog) {
  const text = String(fullLog || '')
  const passingMatch = text.match(/(\d+)\s+passing/)
  const failingMatch = text.match(/(\d+)\s+failing/)
  const failures = []
  const lines = text.split(/\r?\n/)
  for (const ln of lines) {
    // Examples: "  1) Suite name" OR "1) Suite name test name"
    const m = ln.match(/^\s*(\d+)\)\s+(.+)/)
    if (m) failures.push(m[2].trim())
  }
  return {
    passing: passingMatch ? Number(passingMatch[1]) : 0,
    failing: failingMatch ? Number(failingMatch[1]) : (failures.length || 0),
    failures
  }
}

