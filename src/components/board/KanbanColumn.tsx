'use client'

import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Chip, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface KanbanColumnProps {
  title: string
  count: number
  children: ReactNode
}

export function KanbanColumn({ title, count, children }: KanbanColumnProps) {
  return (
    <Box sx={{ width: 280, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Chip label={count} size="small" />
        </Box>
        <Button variant="text" size="small" startIcon={<AddIcon />}>
          Add
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 2 }}>{children}</Box>
    </Box>
  )
}
