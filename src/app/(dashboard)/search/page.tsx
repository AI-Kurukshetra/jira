'use client'

import { Suspense, useMemo } from 'react'
import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { apiGet } from '@/lib/api/client'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'

interface SearchResponse {
  issues: Array<{ id: string; issue_key: string; summary: string; project?: { key?: string | null } | null }>
  projects: Array<{ id: string; name: string; key: string }>
}

function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('query') ?? ''
  const projectId = searchParams.get('projectId') ?? undefined
  const scope = searchParams.get('scope') ?? 'all'

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search-page', query, projectId ?? 'all', scope],
    enabled: query.trim().length >= 2,
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('query', query.trim())
      if (projectId) params.set('projectId', projectId)
      params.set('scope', scope)
      const result = await apiGet<SearchResponse>(`/api/search?${params.toString()}`)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })

  const hasResults = (data?.issues.length ?? 0) > 0 || (data?.projects.length ?? 0) > 0

  const issueRows = useMemo(() => data?.issues ?? [], [data])
  const projectRows = useMemo(() => data?.projects ?? [], [data])

  if (!query) {
    return <EmptyState title="Search Jira Bacancy" description="Enter at least 2 characters to search." />
  }

  if (isLoading) {
    return <LoadingSkeleton rows={6} height={28} />
  }

  if (isError) {
    return <Typography variant="body2" sx={{ color: 'error.main' }}>Search failed.</Typography>
  }

  if (!hasResults) {
    return <EmptyState title="No results" description="Try another query or adjust your filters." />
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          size="small"
          variant={scope === 'all' ? 'contained' : 'outlined'}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.set('scope', 'all')
            router.push(`/search?${params.toString()}`)
          }}
        >
          All Results
        </Button>
        <Button
          size="small"
          variant={scope === 'project' ? 'contained' : 'outlined'}
          disabled={!projectId}
          onClick={() => {
            if (!projectId) return
            const params = new URLSearchParams(searchParams.toString())
            params.set('scope', 'project')
            router.push(`/search?${params.toString()}`)
          }}
        >
          Current Project
        </Button>
      </Box>
      <Card>
        <CardContent sx={{ display: 'grid', gap: 1 }}>
          <Typography variant="h3">Issues</Typography>
          {issueRows.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No matching issues.
            </Typography>
          )}
          {issueRows.map((issue) => (
            <Box
              key={issue.id}
              sx={(theme) => ({
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                px: 1.5,
                py: 1,
                cursor: 'pointer',
                '&:hover': { backgroundColor: theme.palette.background.default }
              })}
              onClick={() => {
                const projectKey = issue.project?.key
                if (projectKey) {
                  router.push(`/projects/${projectKey}/issues/${issue.issue_key}`)
                }
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {issue.issue_key}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {issue.summary}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ display: 'grid', gap: 1 }}>
          <Typography variant="h3">Projects</Typography>
          {projectRows.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No matching projects.
            </Typography>
          )}
          {projectRows.map((project) => (
            <Box
              key={project.id}
              sx={(theme) => ({
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                px: 1.5,
                py: 1,
                cursor: 'pointer',
                '&:hover': { backgroundColor: theme.palette.background.default }
              })}
              onClick={() => router.push(`/projects/${project.key}`)}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {project.key}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {project.name}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  )
}

export default function SearchPage() {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Search Results" subtitle="Results across issues and projects." />
      <Suspense fallback={<LoadingSkeleton rows={6} height={28} />}>
        <SearchResults />
      </Suspense>
    </Box>
  )
}
