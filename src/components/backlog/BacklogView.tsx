'use client'

import { Box } from '@mui/material'

import { SprintSection } from './SprintSection'
import type { Issue, Sprint } from '@/lib/types'

interface BacklogViewProps {
  activeSprint?: Sprint | null
  futureSprints: Sprint[]
  backlogIssues: Issue[]
  sprintIssues: Record<string, Issue[]>
}

export function BacklogView({ activeSprint, futureSprints, backlogIssues, sprintIssues }: BacklogViewProps) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {activeSprint && (
        <SprintSection
          title={activeSprint.name}
          subtitle="Active Sprint"
          active
          issues={sprintIssues[activeSprint.id] ?? []}
        />
      )}
      {futureSprints.map((sprint) => (
        <SprintSection
          key={sprint.id}
          title={sprint.name}
          subtitle="Future Sprint"
          issues={sprintIssues[sprint.id] ?? []}
        />
      ))}
      <SprintSection title="Backlog" subtitle="Unscheduled" issues={backlogIssues} />
    </Box>
  )
}
