'use client'

import { Chip, MenuItem, Select, Stack } from '@mui/material'

const DEFAULT_LABELS = ['Design', 'Frontend', 'Backend', 'Bugfix']

interface LabelMultiSelectProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function LabelMultiSelect({ value, onChange }: LabelMultiSelectProps) {
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
      {DEFAULT_LABELS.map((label) => (
        <MenuItem key={label} value={label}>
          {label}
        </MenuItem>
      ))}
    </Select>
  )
}
