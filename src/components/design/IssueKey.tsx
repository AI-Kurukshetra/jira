'use client'

import { Box, Typography } from '@mui/material'

interface IssueKeyProps {
  value: string
}

export function IssueKey({ value }: IssueKeyProps) {
  return (
    <Box
      sx={(theme) => ({
        display: 'inline-flex',
        alignItems: 'center',
        px: 0.75,
        py: 0.25,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        transition: 'all 0.15s ease',
        '&:hover': {
          color: '#A78BFA',
          borderColor: '#2D1B5E',
          boxShadow: '0 0 0 2px rgba(124,58,237,0.12)'
        }
      })}
    >
      <Typography
        variant="caption"
        sx={{ fontFamily: '"JetBrains Mono", monospace', color: 'text.tertiary', fontSize: '0.75rem' }}
      >
        {value}
      </Typography>
    </Box>
  )
}
