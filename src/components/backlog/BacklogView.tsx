'use client'

import { Box } from '@mui/material'

import { SprintSection } from './SprintSection'
import type { Issue, Sprint } from '@/lib/types'

interface BacklogViewProps {
  activeSprint?: Sprint | null
  futureSprints: Sprint[]
  backlogIssues: Issue[]
  sprintIssues: Record<string, Issue[]>
  projectKey?: string
  onStartSprint?: (sprint: Sprint) => void
  onCompleteSprint?: (sprint: Sprint) => void
  onAddIssue?: (sprintId?: string | null) => void
}

export function BacklogView({
  activeSprint,
  futureSprints,
  backlogIssues,
  sprintIssues,
  projectKey,
  onStartSprint,
  onCompleteSprint,
  onAddIssue
}: BacklogViewProps) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {activeSprint && (
        <SprintSection
          title={activeSprint.name}
          subtitle="Active Sprint"
          active
          issues={sprintIssues[activeSprint.id] ?? []}
          {...(projectKey ? { projectKey } : {})}
          canComplete
          onComplete={() => onCompleteSprint?.(activeSprint)}
          onAddIssue={() => onAddIssue?.(activeSprint.id)}
        />
      )}
      {futureSprints.map((sprint) => (
        <SprintSection
          key={sprint.id}
          title={sprint.name}
          subtitle="Future Sprint"
          issues={sprintIssues[sprint.id] ?? []}
          {...(projectKey ? { projectKey } : {})}
          canStart
          onStart={() => onStartSprint?.(sprint)}
          onAddIssue={() => onAddIssue?.(sprint.id)}
        />
      ))}
      <SprintSection
        title="Backlog"
        subtitle="Unscheduled"
        issues={backlogIssues}
        {...(projectKey ? { projectKey } : {})}
        onAddIssue={() => onAddIssue?.(null)}
      />
    </Box>
  )
}
