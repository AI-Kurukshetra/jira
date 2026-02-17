'use client'

import { Box } from '@mui/material'

import { SprintSection } from './SprintSection'

export function BacklogView() {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SprintSection title="Sprint 12" subtitle="Feb 10 - Feb 24" active />
      <SprintSection title="Sprint 13" subtitle="Mar 1 - Mar 15" />
    </Box>
  )
}
