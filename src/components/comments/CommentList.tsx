'use client'

import { Box, Button, TextField, Typography } from '@mui/material'
import { useState } from 'react'

import { UserAvatar } from '@/components/design/UserAvatar'

interface CommentItem {
  id: string
  author: { id: string; name: string }
  body: string
  timestamp: string
  isDeleted: boolean
  canEdit: boolean
}

interface CommentListProps {
  comments: CommentItem[]
  onEdit: (id: string, body: string) => Promise<void> | void
  onDelete: (id: string) => Promise<void> | void
}

export function CommentList({ comments, onEdit, onDelete }: CommentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  const startEdit = (comment: CommentItem) => {
    setEditingId(comment.id)
    setDraft(comment.body)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraft('')
  }

  const saveEdit = async () => {
    if (!editingId) return
    await onEdit(editingId, draft)
    cancelEdit()
  }

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
            {comment.canEdit && !comment.isDeleted && (
              <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
                <Button size="small" variant="text" onClick={() => startEdit(comment)}>
                  Edit
                </Button>
                <Button size="small" color="error" variant="text" onClick={() => onDelete(comment.id)}>
                  Delete
                </Button>
              </Box>
            )}
          </Box>
          {editingId === comment.id ? (
            <Box sx={{ display: 'grid', gap: 1 }}>
              <TextField
                multiline
                minRows={2}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button size="small" variant="contained" onClick={saveEdit} disabled={!draft.trim()}>
                  Save
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              {comment.body}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  )
}
