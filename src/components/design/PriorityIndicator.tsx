'use client'

import { Box, Typography } from '@mui/material'
import { keyframes } from '@mui/material/styles'

import type { IssuePriority } from '@/lib/types'

interface PriorityIndicatorProps {
  priority: IssuePriority
  showLabel?: boolean
}

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.25); opacity: 0.6; }
  100% { transform: scale(1); opacity: 0.9; }
`

const PRIORITY_STYLES: Record<IssuePriority, { color: string; label: string; pulsing: boolean }> = {
  highest: { color: '#EF4444', label: 'Highest', pulsing: true },
  high: { color: '#F97316', label: 'High', pulsing: false },
  medium: { color: '#EAB308', label: 'Medium', pulsing: false },
  low: { color: '#22C55E', label: 'Low', pulsing: false },
  lowest: { color: '#6B7280', label: 'Lowest', pulsing: false }
}

export function PriorityIndicator({ priority, showLabel = true }: PriorityIndicatorProps) {
  const styles = PRIORITY_STYLES[priority]

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: styles.color,
          position: 'relative',
          '&:hover::after': styles.pulsing
            ? {
                content: '""',
                position: 'absolute',
                inset: -4,
                borderRadius: '50%',
                border: `1px solid ${styles.color}`,
                animation: `${pulse} 1.2s ease-in-out infinite`
              }
            : undefined
        }}
      />
      {showLabel && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {styles.label}
        </Typography>
      )}
    </Box>
  )
}
