'use client'

import { Box, Typography } from '@mui/material'

import { UserAvatar } from '@/components/design/UserAvatar'

interface CommentItem {
  id: string
  author: { id: string; name: string }
  body: string
  timestamp: string
}

interface CommentListProps {
  comments: CommentItem[]
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        No comments yet.
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {comments.map((comment) => (
        <Box key={comment.id} sx={{ display: 'grid', gap: 1, padding: 1.5, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UserAvatar userId={comment.author.id} fullName={comment.author.name} size="xs" />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {comment.author.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.tertiary' }}>
              {comment.timestamp}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.primary' }}>
            {comment.body}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
