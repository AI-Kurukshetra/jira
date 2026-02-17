'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useEffect } from 'react'

import { issueSchema } from '@/lib/validations/schemas'
import { apiPost } from '@/lib/api/client'
import { useProjects } from '@/lib/hooks/useProjects'
import type { Issue, IssuePriority, IssueStatus, IssueType } from '@/lib/types'
import type { z } from 'zod'
import { AssigneeSelect } from '@/components/issues/AssigneeSelect'

type IssueFormValues = z.infer<typeof issueSchema>

const ISSUE_TYPES: IssueType[] = ['story', 'task', 'bug', 'subtask']
const ISSUE_PRIORITIES: IssuePriority[] = ['highest', 'high', 'medium', 'low', 'lowest']
const ISSUE_STATUSES: IssueStatus[] = ['todo', 'inprogress', 'done']

interface CreateIssueModalProps {
  open: boolean
  onClose: () => void
  defaultProjectId?: string
}

export function CreateIssueModal({ open, onClose, defaultProjectId }: CreateIssueModalProps) {
  const queryClient = useQueryClient()
  const { data: projects } = useProjects()

  const { control, register, handleSubmit, reset, formState, watch } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      projectId: defaultProjectId ?? '',
      issueType: 'task',
      summary: '',
      description: '',
      priority: 'medium',
      status: 'todo'
    }
  })

  const selectedProjectId = watch('projectId')

  useEffect(() => {
    if (!open) return
    reset({
      projectId: defaultProjectId ?? '',
      issueType: 'task',
      summary: '',
      description: '',
      priority: 'medium',
      status: 'todo'
    })
  }, [defaultProjectId, open, reset])

  const createIssue = useMutation({
    mutationFn: async (payload: IssueFormValues) => {
      const result = await apiPost<Issue, IssueFormValues>('/api/issues', payload)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['issues'] })
      onClose()
    }
  })

  const onSubmit = (values: IssueFormValues) => {
    createIssue.mutate(values)
  }

  const projectOptions = projects ?? []

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
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
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
              <TextField select label="Status" value={field.value} onChange={field.onChange}>
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
          <TextField
            label="Story Points"
            type="number"
            inputProps={{ min: 0, max: 99 }}
            {...register('storyPoints', {
              setValueAs: (value) => (value === '' ? undefined : Number(value))
            })}
          />
          <TextField
            label="Due Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register('dueDate', { setValueAs: (value) => (value === '' ? undefined : value) })}
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
