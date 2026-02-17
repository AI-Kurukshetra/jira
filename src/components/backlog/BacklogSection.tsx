'use client'

import { BacklogView } from '@/components/backlog/BacklogView'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useProjectByKey } from '@/lib/hooks/useProjectByKey'
import { useSprints } from '@/lib/hooks/useSprints'
import { useIssues } from '@/lib/hooks/useIssues'
import { useCreateIssue } from '@/components/issues/CreateIssueProvider'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { apiPatch, apiPost } from '@/lib/api/client'
import { useQueryClient } from '@tanstack/react-query'
import type { Sprint } from '@/lib/types'
import { IssueFiltersBar } from '@/components/issues/IssueFiltersBar'
import { useIssueFilters } from '@/lib/store/issueFilters'
import { applyIssueFilters } from '@/lib/filters'
import { useMe } from '@/lib/hooks/useMe'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { format } from 'date-fns'

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
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [moveTarget, setMoveTarget] = useState<string>('backlog')
  const [actionError, setActionError] = useState<string | null>(null)
  const [createSprintOpen, setCreateSprintOpen] = useState(false)
  const [sprintName, setSprintName] = useState('')
  const [sprintGoal, setSprintGoal] = useState('')
  const [createStartDate, setCreateStartDate] = useState<Date | null>(null)
  const [createEndDate, setCreateEndDate] = useState<Date | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

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

  const sprintIssues: Record<string, typeof filteredIssues> = {}
  const backlogIssues = filteredIssues.filter((issue) => !issue.sprintId)

  filteredIssues.forEach((issue) => {
    if (!issue.sprintId) return
    if (!sprintIssues[issue.sprintId]) sprintIssues[issue.sprintId] = []
    sprintIssues[issue.sprintId]?.push(issue)
  })

  const shouldShowBacklogView = Boolean(activeSprint || futureSprints.length > 0 || backlogIssues.length > 0)

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setCreateError(null)
            setSprintName('')
            setSprintGoal('')
            setCreateStartDate(null)
            setCreateEndDate(null)
            setCreateSprintOpen(true)
          }}
        >
          Create Sprint
        </Button>
      </Box>
      {project?.id && <IssueFiltersBar projectId={project.id} />}
      {shouldShowBacklogView ? (
        <BacklogView
          activeSprint={activeSprint}
          futureSprints={futureSprints}
          backlogIssues={backlogIssues}
          sprintIssues={sprintIssues}
          projectKey={project?.key}
          onStartSprint={(sprint) => {
            setActionError(null)
            setStartDate(null)
            setEndDate(null)
            setStartSprint(sprint)
        }}
          onCompleteSprint={(sprint) => {
            setActionError(null)
            setMoveTarget('backlog')
          setCompleteSprint(sprint)
        }}
      />
      ) : (
        <EmptyState
          title="No issues yet"
          description="Create issues to start planning your backlog."
          actionLabel="Create issue"
          onAction={() => openCreateIssue(project?.id)}
        />
      )}

      <Dialog open={Boolean(startSprint)} onClose={() => setStartSprint(null)}>
        <DialogTitle>Start Sprint</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, minWidth: 360 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Define sprint dates to activate {startSprint?.name}.
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(value) => setStartDate(value)}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(value) => setEndDate(value)}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>
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
                startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
                endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined
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

      <Dialog open={createSprintOpen} onClose={() => setCreateSprintOpen(false)}>
        <DialogTitle>Create Sprint</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, minWidth: 360 }}>
          <TextField
            label="Sprint name"
            value={sprintName}
            onChange={(e) => setSprintName(e.target.value)}
          />
          <TextField
            label="Goal (optional)"
            value={sprintGoal}
            onChange={(e) => setSprintGoal(e.target.value)}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date (optional)"
              value={createStartDate}
              onChange={(value) => setCreateStartDate(value)}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="End Date (optional)"
              value={createEndDate}
              onChange={(value) => setCreateEndDate(value)}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>
          {createError && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {createError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateSprintOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!project?.id) return
              if (!sprintName.trim()) {
                setCreateError('Sprint name is required.')
                return
              }
              setCreateError(null)
              const result = await apiPost(`/api/sprints`, {
                projectId: project.id,
                name: sprintName.trim(),
                goal: sprintGoal.trim() || undefined,
                startDate: createStartDate ? format(createStartDate, 'yyyy-MM-dd') : undefined,
                endDate: createEndDate ? format(createEndDate, 'yyyy-MM-dd') : undefined
              })
              if (!result.success) {
                setCreateError(result.error)
                return
              }
              await queryClient.invalidateQueries({ queryKey: ['sprints'] })
              setCreateSprintOpen(false)
            }}
          >
            Create Sprint
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
