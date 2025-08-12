import React, { useEffect, useState } from 'react'
import {
  Paper, Grid, Stack, Button, Chip, Typography, Alert, Box, Snackbar,
  Breadcrumbs, Link as MLink, LinearProgress
} from '@mui/material'
import Editor from '@monaco-editor/react'
import NotFound from './NotFound.jsx'

export default function Exercise({ id }) {
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState(null)
  const [log, setLog] = useState('')
  const [running, setRunning] = useState(false)
  const [edited, setEdited] = useState({})
  const [exitCode, setExitCode] = useState(null)
  const [summary, setSummary] = useState(null)
  const [showHints, setShowHints] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [solution, setSolution] = useState(null)
  const [solutionLoading, setSolutionLoading] = useState(false)
  const [solutionError, setSolutionError] = useState(null)
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })

  const resetToStarter = () => {
    try {
      if (!meta?.starter?.files) return
      const init = {}
      for (const f of meta.starter.files) init[f.path] = f.content
      setEdited(init)
      localStorage.removeItem(`sb:code:${id}`)
    } catch {}
  }

  useEffect(() => {
    setError(null)
    setMeta(null)
    fetch(`/exercises/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          if (r.status === 404) throw new Error('not_found')
          const text = await r.text().catch(() => '')
          throw new Error(text || `http_${r.status}`)
        }
        return r.json()
      })
      .then(setMeta)
      .catch((e) => setError(String(e?.message || e)))
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
        try {
          const s = parseMochaSummary(log)
          setSummary(s)
        } catch {}
        setSnack({ open: true, message: d.code === 0 ? 'All tests passed' : 'Tests failed', severity: d.code === 0 ? 'success' : 'error' })
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
    const init = {}
    for (const f of meta.starter.files) init[f.path] = f.content
    setEdited(init)
  }, [id, meta])

  useEffect(() => {
    if (!meta?.starter?.files?.length) return
    const key = `sb:code:${id}`
    localStorage.setItem(key, JSON.stringify(edited))
  }, [edited, id, meta])

  if (error === 'not_found') return <NotFound />
  if (error) return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
  if (!meta) return <Paper variant="outlined" sx={{ p: 2, my: 2 }}>Loading…</Paper>

  return (
    <div>
      <Breadcrumbs sx={{ my: 1 }}>
        <MLink href="#/" underline="hover">Exercises</MLink>
        <Typography color="text.secondary" noWrap maxWidth={480}>{meta.title}</Typography>
      </Breadcrumbs>

      {/** removed sticky action bar per request */}

      {/* ---- LAYOUT: MUI Grid, no wrap on md+; right side grows to fill ---- */}
      <Grid
        container
        spacing={2}
        sx={{
          flexWrap: { xs: 'wrap', md: 'nowrap' },    // stack on mobile; sit side-by-side on md+
          alignItems: 'stretch',
        }}
      >
        {/* LEFT rail (fixed width on md+) */}
        <Grid
          item
          xs={12}
          sx={{
            flex: { md: '0 0 520px' },               // fixed column width on md+
            maxWidth: { md: 520 },
          }}
        >
          <Paper variant="outlined" sx={{ p: 2, height: { xs: 'auto', md: 'calc(100dvh - 220px)' } }}>
            <Typography variant="h6" sx={{ mt: 0 }}>{meta.title}</Typography>
            {/** Temporarily hide difficulty/tags */}
            {/**
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              [{meta.difficulty}] {meta.tags?.join(', ')}
            </Typography>
            */}
            <Typography sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{String(meta.description || '').replace(/`/g, '')}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => setShowHints(v => !v)}
                sx={showHints ? {
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  boxShadow: 'none',
                  border: 1,
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'background.paper', boxShadow: 'none' }
                } : {}}
              >
                {showHints ? 'Hide Hints' : 'Show Hints'}
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={async () => {
                  setShowSolution((v) => !v)
                  if (!showSolution && !solution && !solutionLoading) {
                    try {
                      setSolutionError(null)
                      setSolutionLoading(true)
                      const r = await fetch(`/exercises/${id}/solution`)
                      if (!r.ok) {
                        const msg = r.status === 401 ? 'Login required' : r.status === 403 ? 'Locked until you pass' : `Error ${r.status}`
                        throw new Error(msg)
                      }
                      const d = await r.json()
                      setSolution(d)
                    } catch (e) {
                      setSolutionError(String(e?.message || e))
                    } finally {
                      setSolutionLoading(false)
                    }
                  }
                }}
                sx={showSolution ? {
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  boxShadow: 'none',
                  border: 1,
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'background.paper', boxShadow: 'none' }
                } : {}}
              >
                {showSolution ? 'Hide Solution' : 'View Solution'}
              </Button>
            </Stack>
            {showHints && (
              <Stack component="ul" sx={{ mt: 1, pl: 2 }}>
                {(meta.hints || []).map((h, i) => (
                  <Typography key={i} component="li" variant="body2" color="text.secondary">{h}</Typography>
                ))}
              </Stack>
            )}
            {showSolution && (
              <Box sx={{ mt: 1 }}>
                {solutionLoading && <Typography variant="body2" color="text.secondary">Loading solution…</Typography>}
                {solutionError && <Alert severity="warning" sx={{ my: 1 }}>{solutionError}</Alert>}
                {solution?.files?.length > 0 && (
                  <Stack sx={{ mt: 1 }}>
                    {solution.files.map((f) => (
                      <Box key={f.path} sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{f.path}</Typography>
                        <Box component="pre" sx={{
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                          whiteSpace: 'pre',
                          m: 0,
                          fontSize: 13,
                          lineHeight: 1.55,
                          overflow: 'auto',
                          p: 1,
                          bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
                          borderRadius: 1,
                          border: 1,
                          borderColor: 'divider'
                        }}>
                          {f.content}
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
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

        {/* RIGHT rail (fills remaining width) */}
        <Grid
          item
          xs={12}
          sx={{
            flex: { md: '1 1 auto' },                // <- grow to occupy all remaining width
            minWidth: 0,                             // <- critical so children can expand
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              height: { xs: 'auto', md: 'calc(100dvh - 220px)' },
              pl: 2,
              borderLeft: 1,
              borderColor: 'divider',
              minWidth: 0,
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                minWidth: 0,
              }}
            >
              {running && (
                <LinearProgress sx={{ position: 'sticky', top: 0, left: 0, right: 0, mb: 1 }} />
              )}
              {(() => {
                const files = (meta.starter?.files || []).filter(f => !/hardhat\.config\.(?:js|cjs|ts)$/i.test(f.path))
                const single = files.length === 1
                return (
                  <Box sx={{ overflow: 'auto', flex: 1, width: '100%', minWidth: 0 }}>
                    {files.map((f, i) => (
                      <Box
                        key={f.path}
                        sx={{
                          mb: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          width: '100%',
                          minWidth: 0,
                          ...(single ? { height: '100%' } : {}),
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              fontFamily:
                                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                            }}
                          >
                            {f.path}
                          </Typography>
                          {i === 0 && (
                            <Stack direction="row" spacing={1} alignItems="center">
                              {exitCode !== null && (
                                <Chip color={exitCode === 0 ? 'success' : 'error'} label={exitCode === 0 ? 'Passed' : 'Failed'} size="small" />
                              )}
                              {/** Temporarily hide per-run pass/fail counts */}
                              {/**
                              {summary && (
                                <Typography variant="caption" color="text.secondary">
                                  {summary.passing} passed{typeof summary.failing === 'number' ? `, ${summary.failing} failed` : ''}
                                </Typography>
                              )}
                              */}
                              <Button size="small" variant="outlined" onClick={resetToStarter} disabled={running}>Reset to Start</Button>
                              <Button size="small" variant="contained" onClick={() => run('starter')} disabled={running}>Run Code</Button>
                            </Stack>
                          )}
                        </Stack>
                        <Editor
                          height={single ? '100%' : '220px'}
                          theme="vs-dark"
                          defaultLanguage={f.path.endsWith('.sol') ? 'plaintext' : 'javascript'}
                          value={edited[f.path] ?? f.content}
                          onChange={(v) => setEdited(prev => ({ ...prev, [f.path]: v ?? '' }))}
                          options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false, automaticLayout: true }}
                        />
                      </Box>
                    ))}
                  </Box>
                )
              })()}
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                minWidth: 0,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Button size="small" variant="outlined" onClick={() => navigator.clipboard.writeText(log || '')} disabled={!log}>Copy</Button>
                <Button size="small" variant="text" onClick={() => setLog('')} disabled={!log}>Clear</Button>
              </Stack>
              <Box
                component="pre"
                sx={{
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  whiteSpace: 'pre-wrap',
                  m: 0,
                  fontSize: 13,
                  lineHeight: 1.55,
                  overflow: 'auto',
                  p: 1,
                  bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
                  borderRadius: 1,
                  flex: 1,
                  width: '100%',
                  minWidth: 0,
                }}
              >
                {log || 'Logs will appear here…'}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
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
    const m = ln.match(/^\s*(\d+)\)\s+(.+)/)
    if (m) failures.push(m[2].trim())
  }
  return {
    passing: passingMatch ? Number(passingMatch[1]) : 0,
    failing: failingMatch ? Number(failingMatch[1]) : (failures.length || 0),
    failures
  }
}
