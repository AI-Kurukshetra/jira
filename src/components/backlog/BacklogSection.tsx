'use client'

import { BacklogView } from '@/components/backlog/BacklogView'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useProjectByKey } from '@/lib/hooks/useProjectByKey'
import { useSprints } from '@/lib/hooks/useSprints'
import { useIssues } from '@/lib/hooks/useIssues'
import { useCreateIssue } from '@/components/issues/CreateIssueProvider'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { apiPatch } from '@/lib/api/client'
import { useQueryClient } from '@tanstack/react-query'
import type { Sprint } from '@/lib/types'
import { IssueFiltersBar } from '@/components/issues/IssueFiltersBar'
import { useIssueFilters } from '@/lib/store/issueFilters'
import { applyIssueFilters } from '@/lib/filters'
import { useMe } from '@/lib/hooks/useMe'

interface BacklogSectionProps {
  projectKey: string
}

export function BacklogSection({ projectKey }: BacklogSectionProps) {
  const { data: project } = useProjectByKey(projectKey)
  const { openCreateIssue } = useCreateIssue()
  const { data: me } = useMe()
  const { data: sprints, isLoading: sprintsLoading } = useSprints(project?.id)
  const { data: issues, isLoading: issuesLoading } = useIssues(
    project?.id ? { projectId: project.id } : undefined
  )
  const { filters } = useIssueFilters(project?.id ?? 'unknown')
  const queryClient = useQueryClient()

  const [startSprint, setStartSprint] = useState<Sprint | null>(null)
  const [completeSprint, setCompleteSprint] = useState<Sprint | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [moveTarget, setMoveTarget] = useState<string>('backlog')
  const [actionError, setActionError] = useState<string | null>(null)

  const filteredIssues = useMemo(() => {
    if (!issues) return []
    return applyIssueFilters(issues, filters, me?.user.id)
  }, [issues, filters, me?.user.id])

  const activeSprint = sprints?.find((sprint) => sprint.status === 'active') ?? null
  const futureSprints = (sprints ?? []).filter((sprint) => sprint.status === 'pending')

  if (sprintsLoading || issuesLoading) {
    return <LoadingSkeleton rows={6} height={28} />
  }

  if (!project) {
    return <EmptyState title="Project not found" description="We could not find this project." />
  }

  if (filteredIssues.length === 0) {
    return (
      <EmptyState
        title="No issues yet"
        description="Create issues to start planning your backlog."
        actionLabel="Create issue"
        onAction={() => openCreateIssue(project?.id)}
      />
    )
  }

  const sprintIssues: Record<string, typeof filteredIssues> = {}
  const backlogIssues = filteredIssues.filter((issue) => !issue.sprintId)

  filteredIssues.forEach((issue) => {
    if (!issue.sprintId) return
    if (!sprintIssues[issue.sprintId]) sprintIssues[issue.sprintId] = []
    sprintIssues[issue.sprintId]?.push(issue)
  })

  return (
    <>
      {project?.id && <IssueFiltersBar projectId={project.id} />}
      <BacklogView
        activeSprint={activeSprint}
        futureSprints={futureSprints}
        backlogIssues={backlogIssues}
        sprintIssues={sprintIssues}
        onStartSprint={(sprint) => {
          setActionError(null)
          setStartDate('')
          setEndDate('')
          setStartSprint(sprint)
        }}
        onCompleteSprint={(sprint) => {
          setActionError(null)
          setMoveTarget('backlog')
          setCompleteSprint(sprint)
        }}
      />

      <Dialog open={Boolean(startSprint)} onClose={() => setStartSprint(null)}>
        <DialogTitle>Start Sprint</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, minWidth: 360 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Define sprint dates to activate {startSprint?.name}.
          </Typography>
          <TextField
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <TextField
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {actionError && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {actionError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStartSprint(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!startSprint) return
              setActionError(null)
              const result = await apiPatch(`/api/sprints/${startSprint.id}/start`, {
                startDate,
                endDate
              })
              if (!result.success) {
                setActionError(result.error)
                return
              }
              await queryClient.invalidateQueries({ queryKey: ['sprints'] })
              setStartSprint(null)
            }}
            disabled={!startDate || !endDate}
          >
            Start Sprint
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(completeSprint)} onClose={() => setCompleteSprint(null)}>
        <DialogTitle>Complete Sprint</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, minWidth: 360 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Move incomplete issues to another sprint or backlog.
          </Typography>
          <TextField select label="Move incomplete issues to" value={moveTarget} onChange={(e) => setMoveTarget(e.target.value)}>
            <MenuItem value="backlog">Backlog</MenuItem>
            {futureSprints.map((sprint) => (
              <MenuItem key={sprint.id} value={sprint.id}>
                {sprint.name}
              </MenuItem>
            ))}
          </TextField>
          {actionError && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {actionError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteSprint(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!completeSprint) return
              setActionError(null)
              const result = await apiPatch(`/api/sprints/${completeSprint.id}/complete`, {
                moveToSprintId: moveTarget === 'backlog' ? null : moveTarget
              })
              if (!result.success) {
                setActionError(result.error)
                return
              }
              await queryClient.invalidateQueries({ queryKey: ['sprints'] })
              await queryClient.invalidateQueries({ queryKey: ['issues'] })
              setCompleteSprint(null)
            }}
          >
            Complete Sprint
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
