'use client'

import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { Box } from '@mui/material'

import { IssueCard } from '@/components/issues/IssueCard'
import type { IssuePriority, IssueType } from '@/lib/types'

interface SortableIssueCardProps {
  id: string
  issueKey: string
  summary: string
  issueType: IssueType
  priority: IssuePriority
  labels?: string[]
  assignee?: { id: string; name: string }
  storyPoints?: number
  href?: string
}

export function SortableIssueCard({ id, ...props }: SortableIssueCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <Box
      ref={setNodeRef}
      sx={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      {...attributes}
      {...listeners}
    >
      <IssueCard {...props} />
    </Box>
  )
}
