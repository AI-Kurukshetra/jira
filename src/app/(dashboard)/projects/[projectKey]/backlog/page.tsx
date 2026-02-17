'use client'

import { Box } from '@mui/material'

import { BacklogSection } from '@/components/backlog/BacklogSection'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { use } from 'react'

export default function BacklogPage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = use(params)
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Backlog" subtitle="Plan upcoming sprints and priorities." />
      <BacklogSection projectKey={projectKey} />
    </Box>
  )
}
