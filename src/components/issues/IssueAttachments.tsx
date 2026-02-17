'use client'

import AttachFileIcon from '@mui/icons-material/AttachFile'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Box, Button, IconButton, Typography } from '@mui/material'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createClient } from '@/lib/supabase/client'
import { apiDelete, apiGet, apiPost } from '@/lib/api/client'
import { ALLOWED_ATTACHMENT_TYPES, MAX_ATTACHMENT_BYTES, ATTACHMENTS_BUCKET } from '@/config/constants'

interface IssueAttachmentsProps {
  issueId: string
}

interface AttachmentRow {
  id: string
  fileName: string
  fileSize?: number | null
  fileType?: string | null
  storagePath: string
}

export function IssueAttachments({ issueId }: IssueAttachmentsProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: items = [] } = useQuery({
    queryKey: ['attachments', issueId],
    queryFn: async () => {
      const result = await apiGet<AttachmentRow[]>(`/api/issues/${issueId}/attachments`)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })

  const deleteAttachment = useMutation({
    mutationFn: async (attachmentId: string) => {
      const result = await apiDelete<AttachmentRow, { attachmentId: string }>(
        `/api/issues/${issueId}/attachments`,
        { attachmentId }
      )
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onMutate: async (attachmentId) => {
      await queryClient.cancelQueries({ queryKey: ['attachments', issueId] })
      const previous = queryClient.getQueryData<AttachmentRow[]>(['attachments', issueId])
      queryClient.setQueryData<AttachmentRow[]>(
        ['attachments', issueId],
        (current) => current?.filter((item) => item.id !== attachmentId) ?? []
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['attachments', issueId], context.previous)
      }
    }
  })

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setError(`File exceeds ${MAX_ATTACHMENT_BYTES / (1024 * 1024)}MB limit.`)
      return
    }

    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
      setError('Unsupported file type.')
      return
    }

    setUploading(true)
    const supabase = createClient()
    const storagePath = `${issueId}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(storagePath, file, {
      upsert: false
    })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const metaResult = await apiPost<AttachmentRow, Omit<AttachmentRow, 'id'>>(
      `/api/issues/${issueId}/attachments`,
      {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        storagePath
      }
    )

    if (!metaResult.success) {
      setError(metaResult.error)
      setUploading(false)
      return
    }

    queryClient.setQueryData<AttachmentRow[]>(
      ['attachments', issueId],
      (current) => (current ? [metaResult.data, ...current] : [metaResult.data])
    )
    setUploading(false)
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Attachments
        </Typography>
        <Button component="label" size="small" variant="outlined" startIcon={<AttachFileIcon />}> 
          Upload
          <input type="file" hidden onChange={onFileChange} />
        </Button>
      </Box>
      {error && (
        <Typography variant="caption" sx={{ color: 'error.main' }}>
          {error}
        </Typography>
      )}
      {uploading && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Uploading...
        </Typography>
      )}
      {items.length === 0 ? (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          No attachments yet.
        </Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: 0.5 }}>
          {items.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.primary' }}>
                  {item.fileName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {item.fileSize ? `${Math.round(item.fileSize / 1024)} KB` : ''}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => deleteAttachment.mutate(item.id)}>
                <DeleteOutlineIcon fontSize="inherit" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
