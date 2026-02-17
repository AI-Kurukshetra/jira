'use client'

import { Box, ButtonGroup, Button } from '@mui/material'
import { useState } from 'react'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProjectsActions } from '@/components/projects/ProjectsActions'
import { ProjectsSection } from '@/components/projects/ProjectsSection'
import type { ProjectStatus } from '@/lib/types'

export default function ProjectsPage() {
  const [status, setStatus] = useState<ProjectStatus>('active')

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader
        title="Projects"
        subtitle="Manage your active and archived projects."
        action={
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <ButtonGroup size="small" variant="outlined">
              <Button onClick={() => setStatus('active')} variant={status === 'active' ? 'contained' : 'outlined'}>
                Active
              </Button>
              <Button onClick={() => setStatus('archived')} variant={status === 'archived' ? 'contained' : 'outlined'}>
                Archived
              </Button>
              <Button onClick={() => setStatus('deleted')} variant={status === 'deleted' ? 'contained' : 'outlined'}>
                Trash
              </Button>
            </ButtonGroup>
            <ProjectsActions />
          </Box>
        }
      />
      <ProjectsSection status={status} />
    </Box>
  )
}
