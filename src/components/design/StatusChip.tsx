'use client'

import { Chip } from '@mui/material'
import { alpha } from '@mui/material/styles'

import type { IssueStatus } from '@/lib/types'

interface StatusChipProps {
  status: IssueStatus
  size?: 'small' | 'medium'
}

const STATUS_STYLES: Record<IssueStatus, { background: string; color: string; border: string; label: string }> = {
  todo: {
    background: alpha('#4B5563', 0.15),
    color: '#9CA3AF',
    border: '1px solid rgba(75,85,99,0.3)',
    label: 'To Do'
  },
  inprogress: {
    background: alpha('#2563EB', 0.15),
    color: '#60A5FA',
    border: '1px solid rgba(37,99,235,0.3)',
    label: 'In Progress'
  },
  done: {
    background: alpha('#059669', 0.15),
    color: '#34D399',
    border: '1px solid rgba(5,150,105,0.3)',
    label: 'Done'
  }
}

export function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const styles = STATUS_STYLES[status]

  return (
    <Chip
      size={size}
      label={styles.label}
      sx={(theme) => ({
        height: 20,
        borderRadius: theme.shape.borderRadius,
        fontSize: '0.6875rem',
        fontWeight: 600,
        backgroundColor: styles.background,
        color: styles.color,
        border: styles.border
      })}
    />
  )
}
