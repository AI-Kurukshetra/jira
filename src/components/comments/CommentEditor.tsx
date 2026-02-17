'use client'

import { Box, Button, IconButton, Stack, Tooltip } from '@mui/material'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import CodeIcon from '@mui/icons-material/Code'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import LinkIcon from '@mui/icons-material/Link'
import { useMemo } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'

interface CommentEditorProps {
  placeholder?: string
  onSubmit?: (body: string) => Promise<void> | void
  submitLabel?: string
  isSubmitting?: boolean
}

export function CommentEditor({
  placeholder = 'Write a comment...',
  onSubmit,
  submitLabel = 'Post comment',
  isSubmitting
}: CommentEditorProps) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true }
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false })
    ],
    [placeholder]
  )

  const editor = useEditor({
    extensions,
    editorProps: {
      attributes: {
        class: 'projecthub-editor'
      }
    }
  })

  if (!editor) return null

  const handleSubmit = async () => {
    if (!onSubmit) return
    const text = editor.getText().trim()
    if (!text) return
    await onSubmit(text)
    editor.commands.clearContent()
  }

  return (
    <Box
      sx={(theme) => ({
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        overflow: 'hidden'
      })}
    >
      <Stack direction="row" spacing={0.5} sx={{ px: 1, py: 0.5, borderBottom: `1px solid ${'#1E1E2E'}` }}>
        <Tooltip title="Bold">
          <IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()}>
            <FormatBoldIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic">
          <IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()}>
            <FormatItalicIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Code">
          <IconButton size="small" onClick={() => editor.chain().focus().toggleCode().run()}>
            <CodeIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="List">
          <IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <FormatListBulletedIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Link">
          <IconButton size="small" onClick={() => editor.chain().focus().toggleLink({ href: 'https://example.com' }).run()}>
            <LinkIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          '& .projecthub-editor': {
            minHeight: 120,
            outline: 'none',
            color: 'text.primary',
            fontSize: '0.875rem'
          },
          '& .projecthub-editor p.is-editor-empty:first-of-type::before': {
            content: 'attr(data-placeholder)',
            color: 'text.tertiary',
            float: 'left',
            height: 0,
            pointerEvents: 'none'
          }
        }}
      >
        <EditorContent editor={editor} />
      </Box>
      {onSubmit && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pb: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            {...(isSubmitting !== undefined ? { disabled: isSubmitting } : {})}
          >
            {isSubmitting ? 'Posting...' : submitLabel}
          </Button>
        </Box>
      )}
    </Box>
  )
}
