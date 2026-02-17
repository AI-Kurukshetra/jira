'use client'

import { Box, Button, Chip, MenuItem, TextField, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

import { useIssueFilters } from '@/lib/store/issueFilters'
import { useProjectMembers } from '@/lib/hooks/useProjectMembers'
import { useLabels } from '@/lib/hooks/useLabels'
import { useMe } from '@/lib/hooks/useMe'
import type { IssueFilters } from '@/lib/types/filters'
import type { IssuePriority, IssueStatus, IssueType } from '@/lib/types'
import { useSprints } from '@/lib/hooks/useSprints'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { format } from 'date-fns'

interface SavedFilter {
  id: string
  name: string
  filters: IssueFilters
}

interface IssueFiltersBarProps {
  projectId: string
}

const ISSUE_TYPES: IssueType[] = ['story', 'task', 'bug', 'subtask']
const ISSUE_PRIORITIES: IssuePriority[] = ['highest', 'high', 'medium', 'low', 'lowest']
const ISSUE_STATUSES: IssueStatus[] = ['todo', 'inprogress', 'done']

const MAX_SAVED_FILTERS = 10
const savedKey = (projectId: string, userId?: string) => `saved-filters:${projectId}:${userId ?? 'anon'}`

export function IssueFiltersBar({ projectId }: IssueFiltersBarProps) {
  const { filters, setFilters, resetFilters } = useIssueFilters(projectId)
  const { data: members } = useProjectMembers(projectId)
  const { data: labels } = useLabels(projectId)
  const { data: sprints } = useSprints(projectId)
  const { data: me } = useMe()

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [saveName, setSaveName] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  const toArray = <T,>(value: T | T[]): T[] => (Array.isArray(value) ? value : [value])

  const storageKey = savedKey(projectId, me?.user.id)

  useEffect(() => {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SavedFilter[]
        setSavedFilters(parsed)
      } catch {
        setSavedFilters([])
      }
    }
  }, [storageKey])

  useEffect(() => {
    if (filters.sprintFilter !== 'specific' && filters.sprintId) {
      setFilters({ sprintId: undefined })
    }
  }, [filters.sprintFilter, filters.sprintId, setFilters])

  const persistSaved = (next: SavedFilter[]) => {
    setSavedFilters(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }

  const onSave = () => {
    setSaveError(null)
    if (!saveName.trim()) return
    if (savedFilters.length >= MAX_SAVED_FILTERS) {
      setSaveError(`You can save up to ${MAX_SAVED_FILTERS} filters per project.`)
      return
    }
    const next: SavedFilter = { id: crypto.randomUUID(), name: saveName.trim(), filters }
    persistSaved([...savedFilters, next])
    setSaveName('')
  }

  const onApplySaved = (id: string) => {
    const target = savedFilters.find((item) => item.id === id)
    if (!target) return
    setFilters(target.filters)
  }

  const badgeCount = useMemo(() => {
    let count = 0
    if (filters.query) count += 1
    if (filters.assigneeIds.length > 0) count += 1
    if (filters.reporterIds.length > 0) count += 1
    if (filters.issueTypes.length > 0) count += 1
    if (filters.priorities.length > 0) count += 1
    if (filters.statuses.length > 0) count += 1
    if (filters.labels.length > 0) count += 1
    if (filters.sprintFilter !== 'all') count += 1
    if (filters.dueDateFrom || filters.dueDateTo) count += 1
    if (filters.myOnly) count += 1
    return count
  }, [filters])

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <TextField
          label="Search"
          size="small"
          value={filters.query}
          onChange={(e) => setFilters({ query: e.target.value })}
          sx={{ minWidth: 220 }}
        />
        <TextField
          select
          size="small"
          label="Assignee"
          SelectProps={{ multiple: true, renderValue: (selected) => (selected as string[]).length ? (selected as string[]).length + ' selected' : 'All' }}
          value={filters.assigneeIds}
          onChange={(e) => setFilters({ assigneeIds: toArray(e.target.value) as string[] })}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="unassigned">Unassigned</MenuItem>
          {members?.map((member) => (
            <MenuItem key={member.userId} value={member.userId}>
              {member.profile?.displayName ?? member.profile?.fullName ?? member.userId}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Reporter"
          SelectProps={{ multiple: true, renderValue: (selected) => (selected as string[]).length ? (selected as string[]).length + ' selected' : 'All' }}
          value={filters.reporterIds}
          onChange={(e) => setFilters({ reporterIds: toArray(e.target.value) as string[] })}
          sx={{ minWidth: 200 }}
        >
          {members?.map((member) => (
            <MenuItem key={member.userId} value={member.userId}>
              {member.profile?.displayName ?? member.profile?.fullName ?? member.userId}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Type"
          SelectProps={{ multiple: true, renderValue: (selected) => (selected as string[]).length ? (selected as string[]).length + ' selected' : 'All' }}
          value={filters.issueTypes}
          onChange={(e) => setFilters({ issueTypes: toArray(e.target.value) as IssueType[] })}
          sx={{ minWidth: 160 }}
        >
          {ISSUE_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Priority"
          SelectProps={{ multiple: true, renderValue: (selected) => (selected as string[]).length ? (selected as string[]).length + ' selected' : 'All' }}
          value={filters.priorities}
          onChange={(e) => setFilters({ priorities: toArray(e.target.value) as IssuePriority[] })}
          sx={{ minWidth: 170 }}
        >
          {ISSUE_PRIORITIES.map((priority) => (
            <MenuItem key={priority} value={priority}>
              {priority}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Status"
          SelectProps={{ multiple: true, renderValue: (selected) => (selected as string[]).length ? (selected as string[]).length + ' selected' : 'All' }}
          value={filters.statuses}
          onChange={(e) => setFilters({ statuses: toArray(e.target.value) as IssueStatus[] })}
          sx={{ minWidth: 160 }}
        >
          {ISSUE_STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Labels"
          SelectProps={{ multiple: true, renderValue: (selected) => (selected as string[]).length ? (selected as string[]).length + ' selected' : 'All' }}
          value={filters.labels}
          onChange={(e) => setFilters({ labels: toArray(e.target.value) as string[] })}
          sx={{ minWidth: 160 }}
        >
          {(labels?.length ?? 0) === 0 && (
            <MenuItem value="" disabled>
              No labels
            </MenuItem>
          )}
          {labels?.map((label) => (
            <MenuItem key={label.id} value={label.name}>
              {label.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Sprint"
          value={filters.sprintFilter}
          onChange={(e) => setFilters({ sprintFilter: e.target.value as IssueFilters['sprintFilter'] })}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="backlog">Backlog</MenuItem>
          <MenuItem value="specific">Specific</MenuItem>
        </TextField>
        {filters.sprintFilter === 'specific' && (
          <TextField
            select
            size="small"
            label="Sprint name"
            value={filters.sprintId ?? ''}
            onChange={(e) => setFilters({ sprintId: e.target.value || undefined })}
            sx={{ minWidth: 200 }}
          >
            {(sprints?.length ?? 0) === 0 && (
              <MenuItem value="" disabled>
                No sprints
              </MenuItem>
            )}
            {sprints?.map((sprint) => (
              <MenuItem key={sprint.id} value={sprint.id}>
                {sprint.name}
              </MenuItem>
            ))}
          </TextField>
        )}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Due from"
            value={filters.dueDateFrom ? new Date(filters.dueDateFrom) : null}
            onChange={(value) =>
              setFilters({ dueDateFrom: value ? format(value, 'yyyy-MM-dd') : undefined })
            }
            slotProps={{ textField: { size: 'small' } }}
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Due to"
            value={filters.dueDateTo ? new Date(filters.dueDateTo) : null}
            onChange={(value) =>
              setFilters({ dueDateTo: value ? format(value, 'yyyy-MM-dd') : undefined })
            }
            slotProps={{ textField: { size: 'small' } }}
          />
        </LocalizationProvider>
        <Button
          variant={filters.myOnly ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setFilters({ myOnly: !filters.myOnly })}
        >
          My Issues Only
        </Button>
        <Button variant="text" size="small" onClick={resetFilters}>
          Clear Filters
        </Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip label={`${badgeCount} filters`} size="small" />
        <TextField
          label="Save filter"
          size="small"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <Button size="small" variant="outlined" onClick={onSave} disabled={!saveName.trim()}>
          Save
        </Button>
        <TextField
          select
          size="small"
          label="Saved filters"
          value=""
          onChange={(e) => onApplySaved(String(e.target.value))}
          sx={{ minWidth: 200 }}
        >
          {savedFilters.length === 0 && (
            <MenuItem value="" disabled>
              No saved filters
            </MenuItem>
          )}
          {savedFilters.map((saved) => (
            <MenuItem key={saved.id} value={saved.id}>
              {saved.name}
            </MenuItem>
          ))}
        </TextField>
        {me?.user.email && (
          <Typography variant="caption" sx={{ color: 'text.tertiary' }}>
            Filters saved locally for {me.user.email}
          </Typography>
        )}
        {saveError && (
          <Typography variant="caption" sx={{ color: 'error.main' }}>
            {saveError}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
