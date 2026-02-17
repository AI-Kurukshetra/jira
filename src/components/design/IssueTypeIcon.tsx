'use client'

import BugReportIcon from '@mui/icons-material/BugReport'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import { Box } from '@mui/material'

import type { IssueType } from '@/lib/types'

interface IssueTypeIconProps {
  type: IssueType
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP: Record<NonNullable<IssueTypeIconProps['size']>, number> = {
  sm: 16,
  md: 18,
  lg: 22
}

const ICONS: Record<IssueType, { Component: typeof BugReportIcon; color: string }> = {
  story: { Component: BookmarkIcon, color: '#10B981' },
  task: { Component: TaskAltIcon, color: '#3B82F6' },
  bug: { Component: BugReportIcon, color: '#EF4444' },
  subtask: { Component: SubdirectoryArrowRightIcon, color: '#8B5CF6' }
}

export function IssueTypeIcon({ type, size = 'md' }: IssueTypeIconProps) {
  const { Component, color } = ICONS[type]
  const iconSize = SIZE_MAP[size]

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: iconSize,
        height: iconSize,
        color
      }}
    >
      <Component sx={{ fontSize: iconSize }} />
    </Box>
  )
}
