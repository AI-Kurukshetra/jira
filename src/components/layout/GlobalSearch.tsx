'use client'

import SearchIcon from '@mui/icons-material/Search'
import { Box, Button, InputBase, Paper, Popper, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api/client'
import { useProjectByKey } from '@/lib/hooks/useProjectByKey'
import { usePathname, useRouter } from 'next/navigation'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'

interface GlobalSearchProps {
  collapsed: boolean
}

interface SearchResult {
  id: string
  label: string
  type: 'issue' | 'project'
  meta?: string
  issueKey?: string
  projectKey?: string
}

interface SearchResponse {
  issues: Array<{ id: string; issue_key: string; summary: string; project_id: string; project?: { key?: string | null } | null }>
  projects: Array<{ id: string; name: string; key: string }>
}

const MotionPaper = motion(Paper)

export function GlobalSearch({ collapsed }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  const activeProjectKeyMatch = pathname.match(/projects\/([^/]+)/)
  const projectKey = activeProjectKeyMatch?.[1] ?? ''
  const { data: project } = useProjectByKey(projectKey)
  const queryProjectKey = project?.key ?? projectKey
  const debouncedQuery = useDebouncedValue(query, 300)

  const { data } = useQuery({
    queryKey: ['search', debouncedQuery, project?.id ?? 'all'],
    enabled: debouncedQuery.trim().length >= 2,
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('query', debouncedQuery.trim())
      if (project?.id) {
        params.set('projectId', project.id)
        params.set('scope', 'project')
      } else {
        params.set('scope', 'all')
      }
      const result = await apiGet<SearchResponse>(`/api/search?${params.toString()}`)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })

  const results = useMemo<SearchResult[]>(() => {
    if (!data) return []
    const issues = data.issues.map((issue) => ({
      id: issue.id,
      label: `${issue.issue_key} · ${issue.summary}`,
      type: 'issue' as const,
      meta: issue.project?.key ?? queryProjectKey ?? issue.project_id,
      issueKey: issue.issue_key,
      projectKey: issue.project?.key ?? queryProjectKey
    }))
    const projects = data.projects.map((projectRow) => ({
      id: projectRow.id,
      label: `${projectRow.key} · ${projectRow.name}`,
      type: 'project' as const,
      projectKey: projectRow.key
    }))
    return [...issues, ...projects]
  }, [data, queryProjectKey])

  const grouped = useMemo(() => {
    const issues = results.filter((item) => item.type === 'issue')
    const projects = results.filter((item) => item.type === 'project')
    return { issues, projects }
  }, [results])

  const hasResults = results.length > 0

  return (
    <Box ref={setAnchorEl} sx={{ position: 'relative' }}>
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
          onKeyDown={(event) => {
            if (event.key === 'Enter' && query.trim().length >= 2) {
              const params = new URLSearchParams()
              params.set('query', query.trim())
              if (project?.id) {
                params.set('projectId', project.id)
                params.set('scope', 'project')
              } else {
                params.set('scope', 'all')
              }
              router.push(`/search?${params.toString()}`)
            }
          }}
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

      <Popper open={open} anchorEl={anchorEl} placement="bottom" sx={{ zIndex: 1300 }}>
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
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="text"
                  onMouseDown={() => {
                    const params = new URLSearchParams()
                    params.set('query', query.trim())
                    if (project?.id) {
                      params.set('projectId', project.id)
                      params.set('scope', 'project')
                    } else {
                      params.set('scope', 'all')
                    }
                    router.push(`/search?${params.toString()}`)
                  }}
                >
                  View all results
                </Button>
              </Box>
              <Box>
                <Typography variant="overline" sx={{ color: 'text.tertiary' }}>
                  Issues
                </Typography>
                {grouped.issues.map((item) => (
                  <Box
                    key={item.id}
                    onMouseDown={() => {
                      if (item.projectKey && item.issueKey) {
                        router.push(`/projects/${item.projectKey}/issues/${item.issueKey}`)
                      }
                    }}
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
                    onMouseDown={() => {
                      if (item.projectKey) router.push(`/projects/${item.projectKey}`)
                    }}
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
