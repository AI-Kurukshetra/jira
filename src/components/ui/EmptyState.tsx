'use client'

import { Box, Button, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px dashed ${theme.palette.divider}`,
        borderRadius: 2,
        px: 4,
        py: 5,
        gap: 1.5,
        textAlign: 'center',
        backgroundColor: theme.palette.background.paper
      })}
    >
      {icon}
      <Typography variant="h3" sx={{ fontSize: '1.125rem' }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 320 }}>
        {description}
      </Typography>
      {actionLabel && (
        <Button variant="outlined" size="small" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}
