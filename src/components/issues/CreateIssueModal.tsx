'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useEffect, useMemo } from 'react'

import { issueSchema } from '@/lib/validations/schemas'
import { apiPost } from '@/lib/api/client'
import { useProjects } from '@/lib/hooks/useProjects'
import type { Issue, IssuePriority, IssueStatus, IssueType } from '@/lib/types'
import type { z } from 'zod'
import { AssigneeSelect } from '@/components/issues/AssigneeSelect'
import { useSprints } from '@/lib/hooks/useSprints'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { format } from 'date-fns'
import { useBoardColumns } from '@/lib/hooks/useBoardColumns'
import { useIssues } from '@/lib/hooks/useIssues'

type IssueFormValues = z.infer<typeof issueSchema>

const ISSUE_TYPES: IssueType[] = ['story', 'task', 'bug', 'subtask']
const ISSUE_PRIORITIES: IssuePriority[] = ['highest', 'high', 'medium', 'low', 'lowest']
const ISSUE_STATUSES: IssueStatus[] = ['todo', 'inprogress', 'done']

interface CreateIssueModalProps {
  open: boolean
  onClose: () => void
  defaultProjectId?: string
  defaultSprintId?: string
  defaultColumnId?: string
}

export function CreateIssueModal({ open, onClose, defaultProjectId, defaultSprintId, defaultColumnId }: CreateIssueModalProps) {
  const queryClient = useQueryClient()
  const { data: projects } = useProjects()

  const { control, register, handleSubmit, reset, formState, setValue } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      projectId: defaultProjectId ?? '',
      issueType: 'task',
      summary: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      sprintId: defaultSprintId ?? null,
      columnId: defaultColumnId ?? null
    }
  })

  const selectedProjectId = useWatch({ control, name: 'projectId' })
  const selectedColumnId = useWatch({ control, name: 'columnId' })
  const selectedIssueType = useWatch({ control, name: 'issueType' })

  useEffect(() => {
    if (!open) return
    reset({
      projectId: defaultProjectId ?? '',
      issueType: 'task',
      summary: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      sprintId: defaultSprintId ?? null,
      columnId: defaultColumnId ?? null
    })
  }, [defaultProjectId, defaultSprintId, defaultColumnId, open, reset])

  const createIssue = useMutation({
    mutationFn: async (payload: IssueFormValues) => {
      const result = await apiPost<Issue, IssueFormValues>('/api/issues', payload)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['issues'], exact: false })
      onClose()
    }
  })

  const onSubmit = (values: IssueFormValues) => {
    createIssue.mutate(values)
  }

  const projectOptions = useMemo(() => projects ?? [], [projects])
  const { data: sprints } = useSprints(selectedProjectId)
  const { data: projectIssues } = useIssues(selectedProjectId ? { projectId: selectedProjectId } : undefined)
  const { data: columns } = useBoardColumns(selectedProjectId)
  const parentOptions = useMemo(
    () => (projectIssues ?? []).filter((issue) => issue.issueType !== 'subtask'),
    [projectIssues]
  )

  useEffect(() => {
    if (!selectedProjectId && projectOptions.length === 1) {
      setValue('projectId', projectOptions[0]?.id ?? '')
    }
  }, [projectOptions, selectedProjectId, setValue])

  useEffect(() => {
    if (!selectedProjectId) return
    if (!columns || columns.length === 0) return
    if (selectedColumnId) return
    const initialColumn = defaultColumnId
      ? columns.find((column) => column.id === defaultColumnId)
      : columns[0]
    if (initialColumn?.id) {
      setValue('columnId', initialColumn.id)
      setValue('status', initialColumn.status)
    }
  }, [columns, defaultColumnId, selectedColumnId, selectedProjectId, setValue])

  useEffect(() => {
    if (!selectedColumnId || !columns) return
    const column = columns.find((entry) => entry.id === selectedColumnId)
    if (!column) return
    setValue('status', column.status)
  }, [columns, selectedColumnId, setValue])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Issue</DialogTitle>
      <DialogContent sx={{ pt: 1, display: 'grid', gap: 2 }}>
        <Controller
          name="projectId"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label="Project"
              value={field.value}
              onChange={field.onChange}
              error={Boolean(formState.errors.projectId)}
              helperText={formState.errors.projectId?.message}
            >
              {projectOptions.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name} ({project.key})
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        {projectOptions.length === 0 && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Create a project first to add issues.
          </Typography>
        )}
        <Controller
          name="sprintId"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label="Sprint"
              value={field.value ?? ''}
              onChange={(event) => field.onChange(event.target.value || null)}
              disabled={!selectedProjectId}
              SelectProps={{
                displayEmpty: true,
                renderValue: (value) => {
                  if (!value) return 'Backlog'
                  const sprint = sprints?.find((entry) => entry.id === value)
                  return sprint ? sprint.name : 'Backlog'
                }
              }}
              helperText={!selectedProjectId ? 'Select a project to see sprints' : undefined}
            >
              <MenuItem value="">Backlog</MenuItem>
              {sprints?.map((sprint) => (
                <MenuItem key={sprint.id} value={sprint.id}>
                  {sprint.name} {sprint.status === 'active' ? '(Active)' : ''}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="columnId"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label="Column"
              value={field.value ?? ''}
              onChange={(event) => field.onChange(event.target.value || null)}
              disabled={!selectedProjectId}
              helperText={!selectedProjectId ? 'Select a project to see columns' : undefined}
            >
              {(columns?.length ?? 0) === 0 && (
                <MenuItem value="" disabled>
                  No columns
                </MenuItem>
              )}
              {columns?.map((column) => (
                <MenuItem key={column.id} value={column.id}>
                  {column.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="issueType"
          control={control}
          render={({ field }) => (
            <TextField select label="Issue Type" value={field.value} onChange={field.onChange}>
              {ISSUE_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        {selectedIssueType === 'subtask' && (
          <Controller
            name="parentIssueId"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Parent Issue"
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value || null)}
                disabled={!selectedProjectId}
                helperText={!selectedProjectId ? 'Select a project to choose a parent issue' : undefined}
              >
                {(parentOptions.length ?? 0) === 0 && (
                  <MenuItem value="" disabled>
                    No parent issues available
                  </MenuItem>
                )}
                {parentOptions.map((issue) => (
                  <MenuItem key={issue.id} value={issue.id}>
                    {issue.issueKey} — {issue.summary}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        )}
        <TextField
          label="Summary"
          placeholder="Short, clear description"
          {...register('summary')}
          error={Boolean(formState.errors.summary)}
          helperText={formState.errors.summary?.message}
        />
        <TextField
          label="Description"
          multiline
          minRows={3}
          placeholder="Optional details"
          {...register('description')}
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: selectedIssueType === 'bug' ? '1fr' : '1fr 1fr',
            gap: 2
          }}
        >
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <TextField select label="Priority" value={field.value} onChange={field.onChange}>
                {ISSUE_PRIORITIES.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
              <TextField
                select
                label="Status"
                value={field.value}
                onChange={field.onChange}
                disabled={Boolean(selectedColumnId) && Boolean(columns?.length)}
              >
                {ISSUE_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
          )}
        />
        </Box>
        <Controller
          name="assigneeId"
          control={control}
          render={({ field }) => (
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Assignee
              </Typography>
              <AssigneeSelect
                projectId={selectedProjectId}
                value={field.value ?? null}
                onChange={field.onChange}
              />
            </Box>
          )}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {selectedIssueType !== 'bug' && (
            <TextField
              label="Story Points"
              type="number"
              inputProps={{ min: 0, max: 99 }}
              {...register('storyPoints', {
                setValueAs: (value) => (value === '' ? undefined : Number(value))
              })}
            />
          )}
          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={field.value ? new Date(field.value) : null}
                  onChange={(value) => {
                    field.onChange(value ? format(value, 'yyyy-MM-dd') : undefined)
                  }}
                  minDate={new Date()}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </LocalizationProvider>
            )}
          />
        </Box>
        {createIssue.isError && (
          <Typography variant="caption" sx={{ color: 'error.main' }}>
            {createIssue.error?.message ?? 'Failed to create issue.'}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="text">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={createIssue.isPending || projectOptions.length === 0}
        >
          {createIssue.isPending ? 'Creating...' : 'Create Issue'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
