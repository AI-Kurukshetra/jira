'use client'

import { Box, Button, IconButton, TextField, Typography } from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { format } from 'date-fns'

import { apiDelete, apiGet, apiPost } from '@/lib/api/client'
import type { TimeEntry } from '@/lib/types'

interface IssueTimeTrackingProps {
  issueId: string
}

export function IssueTimeTracking({ issueId }: IssueTimeTrackingProps) {
  const queryClient = useQueryClient()
  const [minutes, setMinutes] = useState(30)
  const [description, setDescription] = useState('')
  const [workDate, setWorkDate] = useState<Date | null>(new Date())
  const [error, setError] = useState<string | null>(null)

  const { data: entries = [] } = useQuery({
    queryKey: ['time-entries', issueId],
    queryFn: async () => {
      const result = await apiGet<TimeEntry[]>(`/api/issues/${issueId}/time-entries`)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })

  const totalMinutes = entries.reduce((acc, entry) => acc + entry.minutes, 0)

  const addEntry = useMutation({
    mutationFn: async () => {
      if (!workDate) throw new Error('Select a work date')
      const result = await apiPost<TimeEntry, { workDate: string; minutes: number; description?: string }>(
        `/api/issues/${issueId}/time-entries`,
        {
          workDate: format(workDate, 'yyyy-MM-dd'),
          minutes,
          ...(description.trim() ? { description: description.trim() } : {})
        }
      )
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['time-entries', issueId] })
      setDescription('')
      setError(null)
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to log time')
    }
  })

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const result = await apiDelete(`/api/issues/${issueId}/time-entries`, { id })
      if (!result.success) throw new Error(result.error)
      return true
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['time-entries', issueId] })
    }
  })

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Time Tracking
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {Math.round(totalMinutes / 60)}h {totalMinutes % 60}m
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gap: 1 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Work date"
            value={workDate}
            onChange={(value) => setWorkDate(value)}
            slotProps={{ textField: { size: 'small' } }}
          />
        </LocalizationProvider>
        <TextField
          label="Minutes"
          type="number"
          size="small"
          inputProps={{ min: 1, max: 1440 }}
          value={minutes}
          onChange={(event) => setMinutes(Number(event.target.value))}
        />
        <TextField
          label="Description (optional)"
          size="small"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        {error && (
          <Typography variant="caption" sx={{ color: 'error.main' }}>
            {error}
          </Typography>
        )}
        <Button variant="outlined" size="small" onClick={() => addEntry.mutate()} disabled={addEntry.isPending}>
          {addEntry.isPending ? 'Saving...' : 'Log time'}
        </Button>
      </Box>
      <Box sx={{ display: 'grid', gap: 0.5 }}>
        {entries.length === 0 ? (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            No time logged yet.
          </Typography>
        ) : (
          entries.map((entry) => (
            <Box key={entry.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {entry.workDate} · {entry.minutes}m
                </Typography>
                {entry.description && (
                  <Typography variant="body2">{entry.description}</Typography>
                )}
              </Box>
              <IconButton size="small" onClick={() => deleteEntry.mutate(entry.id)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))
        )}
      </Box>
    </Box>
  )
}
