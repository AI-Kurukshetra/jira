'use client'

import { useDroppable } from '@dnd-kit/core'
import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Chip, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface KanbanColumnProps {
  columnId: string
  title: string
  count: number
  children: ReactNode
  onAdd?: () => void
}

export function KanbanColumn({ columnId, title, count, children, onAdd }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId })

  return (
    <Box
      ref={setNodeRef}
      sx={(theme) => ({
        width: 280,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        borderRadius: 2,
        backgroundColor: isOver ? theme.palette.action.hover : 'transparent',
        transition: 'background-color 0.15s ease'
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Chip label={count} size="small" />
        </Box>
        <Button variant="text" size="small" startIcon={<AddIcon />} onClick={onAdd}>
          Add
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 2 }}>{children}</Box>
    </Box>
  )
}
