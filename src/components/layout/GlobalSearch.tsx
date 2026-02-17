'use client'

import SearchIcon from '@mui/icons-material/Search'
import { Box, InputBase, Paper, Popper, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'

interface GlobalSearchProps {
  collapsed: boolean
}

interface SearchResult {
  id: string
  label: string
  type: 'issue' | 'project'
  meta?: string
}

const placeholderResults: SearchResult[] = []

const MotionPaper = motion(Paper)

export function GlobalSearch({ collapsed }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement | null>(null)

  const results = useMemo(() => {
    if (query.trim().length < 2) return []
    return placeholderResults
  }, [query])

  const grouped = useMemo(() => {
    const issues = results.filter((item) => item.type === 'issue')
    const projects = results.filter((item) => item.type === 'project')
    return { issues, projects }
  }, [results])

  const hasResults = results.length > 0

  return (
    <Box ref={anchorRef} sx={{ position: 'relative' }}>
      <MotionPaper
        layout
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.5,
          width: collapsed ? 220 : 260,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          transition: 'border-color 0.15s ease'
        })}
        animate={{ width: open ? 400 : collapsed ? 220 : 260 }}
      >
        <SearchIcon fontSize="small" />
        <InputBase
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          placeholder="Search issues..."
          sx={{ flex: 1, fontSize: '0.875rem' }}
        />
        <Box
          sx={(theme) => ({
            fontSize: '0.6875rem',
            color: theme.palette.text.tertiary,
            border: `1px solid ${theme.palette.divider}`,
            px: 0.5,
            borderRadius: 1
          })}
        >
          ⌘K
        </Box>
      </MotionPaper>

      <Popper open={open} anchorEl={anchorRef.current} placement="bottom" sx={{ zIndex: 1300 }}>
        <Paper
          elevation={3}
          sx={(theme) => ({
            mt: 1,
            width: 420,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            p: 1.5
          })}
        >
          {!query && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Start typing to search issues and projects.
            </Typography>
          )}
          {query && !hasResults && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              No results yet. Refine your search.
            </Typography>
          )}

          {hasResults && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="overline" sx={{ color: 'text.tertiary' }}>
                  Issues
                </Typography>
                {grouped.issues.map((item) => (
                  <Box
                    key={item.id}
                    sx={(theme) => ({
                      mt: 0.5,
                      px: 1,
                      py: 0.75,
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) }
                    })}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                    {item.meta && (
                      <Typography variant="caption" sx={{ color: 'text.tertiary' }}>
                        {item.meta}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
              <Box>
                <Typography variant="overline" sx={{ color: 'text.tertiary' }}>
                  Projects
                </Typography>
                {grouped.projects.map((item) => (
                  <Box
                    key={item.id}
                    sx={(theme) => ({
                      mt: 0.5,
                      px: 1,
                      py: 0.75,
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) }
                    })}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                    {item.meta && (
                      <Typography variant="caption" sx={{ color: 'text.tertiary' }}>
                        {item.meta}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Popper>
    </Box>
  )
}
