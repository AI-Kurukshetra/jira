'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SaveIcon from '@mui/icons-material/Save'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Typography
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { apiDelete, apiPatch, apiPost } from '@/lib/api/client'
import type { BoardColumn } from '@/lib/types'

const createColumnSchema = z.object({
  name: z.string().min(1, 'Column name is required.').max(100, 'Column name is too long.'),
  status: z.enum(['todo', 'inprogress', 'done'])
})

type CreateColumnValues = z.infer<typeof createColumnSchema>

interface BoardColumnsDialogProps {
  open: boolean
  onClose: () => void
  projectId: string
  columns: BoardColumn[]
}

interface ColumnDraft {
  id: string
  name: string
  status: BoardColumn['status']
  position: number
  isDirty: boolean
}

export function BoardColumnsDialog({ open, onClose, projectId, columns }: BoardColumnsDialogProps) {
  const queryClient = useQueryClient()
  const [drafts, setDrafts] = useState<Record<string, ColumnDraft>>({})

  const defaultValues = useMemo<CreateColumnValues>(
    () => ({
      name: '',
      status: 'todo'
    }),
    []
  )

  const { control, handleSubmit, reset, formState } = useForm<CreateColumnValues>({
    resolver: zodResolver(createColumnSchema),
    defaultValues
  })

  useEffect(() => {
    const nextDrafts: Record<string, ColumnDraft> = {}
    columns.forEach((column) => {
      nextDrafts[column.id] = {
        id: column.id,
        name: column.name,
        status: column.status,
        position: column.position,
        isDirty: false
      }
    })
    setDrafts(nextDrafts)
  }, [columns])

  const createColumn = useMutation({
    mutationFn: async (payload: CreateColumnValues) => {
      const result = await apiPost<BoardColumn, CreateColumnValues & { position: number }>(
        `/api/projects/${projectId}/columns`,
        { ...payload, position: columns.length }
      )
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['board-columns', projectId] })
      reset(defaultValues)
    }
  })

  const updateColumn = useMutation({
    mutationFn: async (payload: { id: string; name: string; status: BoardColumn['status']; position: number }) => {
      const result = await apiPatch<BoardColumn, typeof payload>(`/api/projects/${projectId}/columns`, payload)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['board-columns', projectId] })
    }
  })

  const deleteColumn = useMutation({
    mutationFn: async (columnId: string) => {
      const result = await apiDelete<{ id: string }, { id: string }>(`/api/projects/${projectId}/columns`, {
        id: columnId
      })
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['board-columns', projectId] })
    }
  })

  const hasPending = createColumn.isPending || updateColumn.isPending || deleteColumn.isPending

  const updateDraft = (id: string, patch: Partial<Pick<ColumnDraft, 'name' | 'status'>>) => {
    setDrafts((current) => {
      const existing = current[id]
      if (!existing) return current
      return {
        ...current,
        [id]: {
          ...existing,
          ...patch,
          isDirty: true
        }
      }
    })
  }

  const handleSave = (id: string) => {
    const draft = drafts[id]
    if (!draft || !draft.isDirty) return
    updateColumn.mutate({ id: draft.id, name: draft.name.trim(), status: draft.status, position: draft.position })
  }

  const handleDelete = (id: string) => {
    const confirmed = window.confirm('Delete this column? Issues in the column will be moved to another column.')
    if (!confirmed) return
    deleteColumn.mutate(id)
  }

  const onSubmit = (values: CreateColumnValues) => {
    createColumn.mutate(values)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Manage Columns</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2 }}>
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Add a new column
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 160px auto', gap: 1.5 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Column name"
                  size="small"
                  error={Boolean(formState.errors.name)}
                  helperText={formState.errors.name?.message}
                />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField select label="Status bucket" size="small" value={field.value} onChange={field.onChange}>
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="inprogress">In Progress</MenuItem>
                  <MenuItem value="done">Done</MenuItem>
                </TextField>
              )}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleSubmit(onSubmit)}
              disabled={createColumn.isPending}
            >
              Add
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gap: 1.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Existing columns
          </Typography>
          {columns.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No columns yet. Add one to start.
            </Typography>
          ) : (
            columns.map((column) => {
              const draft = drafts[column.id]
              return (
                <Box
                  key={column.id}
                  sx={{ display: 'grid', gridTemplateColumns: '1fr 160px auto auto', gap: 1.5, alignItems: 'center' }}
                >
                  <TextField
                    label="Name"
                    size="small"
                    value={draft?.name ?? column.name}
                    onChange={(event) => updateDraft(column.id, { name: event.target.value })}
                  />
                  <TextField
                    select
                    label="Status"
                    size="small"
                    value={draft?.status ?? column.status}
                    onChange={(event) =>
                      updateDraft(column.id, { status: event.target.value as BoardColumn['status'] })
                    }
                  >
                    <MenuItem value="todo">To Do</MenuItem>
                    <MenuItem value="inprogress">In Progress</MenuItem>
                    <MenuItem value="done">Done</MenuItem>
                  </TextField>
                  <IconButton
                    size="small"
                    onClick={() => handleSave(column.id)}
                    disabled={!draft?.isDirty || updateColumn.isPending}
                  >
                    <SaveIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(column.id)} disabled={deleteColumn.isPending}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              )
            })
          )}
        </Box>

        {(createColumn.isError || updateColumn.isError || deleteColumn.isError) && (
          <Typography variant="caption" sx={{ color: 'error.main' }}>
            {createColumn.error?.message ??
              updateColumn.error?.message ??
              deleteColumn.error?.message ??
              'Unable to update columns.'}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="text" disabled={hasPending}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
