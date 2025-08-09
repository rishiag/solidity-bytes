import React from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material'
import App from './pages/App.jsx'
import './styles.css'

const root = createRoot(document.getElementById('root'))
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6b46c1' }, // brand purple
    secondary: { main: '#0ea5e9' }
  },
  typography: {
    fontFamily:
      'Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    h6: { fontWeight: 700 },
    button: { textTransform: 'none' }
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 8 } }
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 10 } }
    }
  }
})
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
)

