'use client'

import { Box, Divider, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <Box
      sx={(theme) => ({
        width: '100%',
        maxWidth: 420,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        px: 5,
        py: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      })}
    >
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {subtitle}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</Box>

      <Divider sx={{ borderColor: 'divider', opacity: 0.6 }} />

      {footer && <Box>{footer}</Box>}
    </Box>
  )
}
