import React from 'react'
import { Box, Button, Typography, Stack } from '@mui/material'

export default function NotFound() {
  return (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h4" component="h1">404 — Page not found</Typography>
        <Typography color="text.secondary">The page you are looking for doesn’t exist.</Typography>
        <Button variant="contained" href="#/">Go to Exercises</Button>
      </Stack>
    </Box>
  )
}

