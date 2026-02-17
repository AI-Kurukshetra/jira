'use client'

import AttachFileIcon from '@mui/icons-material/AttachFile'
import { Box, Button, Typography } from '@mui/material'
import { useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import { apiPost } from '@/lib/api/client'
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
  const [items, setItems] = useState<AttachmentRow[]>([])

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

    const metaResult = await apiPost<AttachmentRow, AttachmentRow>(`/api/issues/${issueId}/attachments`, {
      issueId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      storagePath
    })

    if (!metaResult.success) {
      setError(metaResult.error)
      setUploading(false)
      return
    }

    setItems((current) => [...current, metaResult.data])
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
            <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: 'text.primary' }}>
                {item.fileName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {item.fileSize ? `${Math.round(item.fileSize / 1024)} KB` : ''}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
