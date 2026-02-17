'use client'

import { Box } from '@mui/material'

import { IssueCard } from '@/components/issues/IssueCard'
import { KanbanColumn } from './KanbanColumn'

const mockIssues = {
  todo: [
    {
      issueKey: 'PROJ-032',
      summary: 'Design onboarding flow for new members',
      issueType: 'story' as const,
      priority: 'high' as const,
      labels: ['Design'],
      assignee: { id: 'user-1', name: 'Ava Reynolds' },
      storyPoints: 5
    }
  ],
  inprogress: [
    {
      issueKey: 'PROJ-041',
      summary: 'Implement issue activity timeline',
      issueType: 'task' as const,
      priority: 'medium' as const,
      labels: ['Frontend'],
      assignee: { id: 'user-2', name: 'Kai Holt' },
      storyPoints: 3
    }
  ],
  done: [
    {
      issueKey: 'PROJ-018',
      summary: 'Fix stale notification badge count',
      issueType: 'bug' as const,
      priority: 'low' as const,
      labels: ['Bugfix'],
      assignee: { id: 'user-3', name: 'Lena Park' },
      storyPoints: 2
    }
  ]
}

export function KanbanBoard() {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        overflowX: 'auto',
        overflowY: 'hidden',
        py: 2,
        px: 1
      }}
    >
      <KanbanColumn title="To Do" count={mockIssues.todo.length}>
        {mockIssues.todo.map((issue) => (
          <IssueCard key={issue.issueKey} {...issue} />
        ))}
      </KanbanColumn>
      <KanbanColumn title="In Progress" count={mockIssues.inprogress.length}>
        {mockIssues.inprogress.map((issue) => (
          <IssueCard key={issue.issueKey} {...issue} />
        ))}
      </KanbanColumn>
      <KanbanColumn title="Done" count={mockIssues.done.length}>
        {mockIssues.done.map((issue) => (
          <IssueCard key={issue.issueKey} {...issue} />
        ))}
      </KanbanColumn>
    </Box>
  )
}
