'use client'

import { MenuItem, Select } from '@mui/material'

import { useProjectMembers } from '@/lib/hooks/useProjectMembers'

interface AssigneeSelectProps {
  projectId?: string
  value?: string | null
  onChange: (value: string | null) => void
}

export function AssigneeSelect({ projectId, value, onChange }: AssigneeSelectProps) {
  const { data: members } = useProjectMembers(projectId)

  return (
    <Select
      size="small"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? String(e.target.value) : null)}
      displayEmpty
    >
      <MenuItem value="">Unassigned</MenuItem>
      {members?.map((member) => (
        <MenuItem key={member.userId} value={member.userId}>
          {member.profile?.displayName ?? member.profile?.fullName ?? member.userId}
        </MenuItem>
      ))}
    </Select>
  )
}
