'use client'

import { Chip, MenuItem, Select, Stack } from '@mui/material'

import { useLabels } from '@/lib/hooks/useLabels'

interface LabelMultiSelectProps {
  projectId: string
  value: string[]
  onChange: (value: string[]) => void
}

export function LabelMultiSelect({ projectId, value, onChange }: LabelMultiSelectProps) {
  const { data: labels } = useLabels(projectId)

  return (
    <Select
      multiple
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value as string[])}
      renderValue={(selected) => (
        <Stack direction="row" spacing={0.5}>
          {selected.map((item) => (
            <Chip key={item} label={item} size="small" />
          ))}
        </Stack>
      )}
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
    </Select>
  )
}
