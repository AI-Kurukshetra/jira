'use client'

import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { Box } from '@mui/material'
import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { KanbanColumn } from '@/components/board/KanbanColumn'
import { IssueCard } from '@/components/issues/IssueCard'
import { SortableIssueCard } from '@/components/board/SortableIssueCard'
import { apiPatch } from '@/lib/api/client'
import type { Issue, IssueStatus } from '@/lib/types'

interface KanbanBoardProps {
  initialIssues?: Issue[]
}

const STATUS_COLUMNS = [
  { key: 'todo', title: 'To Do' },
  { key: 'inprogress', title: 'In Progress' },
  { key: 'done', title: 'Done' }
] as const

export function KanbanBoard({ initialIssues = [] }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [issues, setIssues] = useState<Issue[]>(initialIssues)
  const queryClient = useQueryClient()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const updateIssue = useMutation({
    mutationFn: async ({ id, status, boardOrder }: { id: string; status: IssueStatus; boardOrder: number }) => {
      const result = await apiPatch<Issue, Partial<Issue>>(`/api/issues/${id}`, {
        status,
        boardOrder
      })
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['issues'] })
      const previous = queryClient.getQueryData<Issue[]>(['issues'])
      if (previous) {
        queryClient.setQueryData<Issue[]>(['issues'], (current) => {
          if (!current) return current
          return current.map((issue) =>
            issue.id === payload.id
              ? { ...issue, status: payload.status as Issue['status'], boardOrder: payload.boardOrder }
              : issue
          )
        })
      }
      return { previous }
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['issues'], context.previous)
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Issue[]>(['issues'], (current) => {
        if (!current) return current
        return current.map((issue) => (issue.id === data.id ? data : issue))
      })
    }
  })

  const grouped = useMemo(() => {
    const map: Record<string, Issue[]> = { todo: [], inprogress: [], done: [] }
    for (const issue of issues) {
      map[issue.status]?.push(issue)
    }
    return map
  }, [issues])

  const activeIssue = issues.find((issue) => issue.id === activeId)

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(event) => setActiveId(event.active.id as string)}
      onDragEnd={(event) => {
        const { active, over } = event
        setActiveId(null)
        if (!over) return

        const activeIdValue = active.id as string
        const overIdValue = over.id as string

        if (activeIdValue === overIdValue) return

        const activeIssue = issues.find((issue) => issue.id === activeIdValue)
        const overIssue = issues.find((issue) => issue.id === overIdValue)

        if (!activeIssue || !overIssue) return

        const updatedStatus = overIssue.status as IssueStatus

        setIssues((current) => {
          const fromIndex = current.findIndex((issue) => issue.id === activeIdValue)
          const toIndex = current.findIndex((issue) => issue.id === overIdValue)
          const moved = arrayMove(current, fromIndex, toIndex)
          return moved.map((issue, index) =>
            issue.id === activeIdValue ? { ...issue, status: updatedStatus, boardOrder: index } : { ...issue, boardOrder: index }
          )
        })

        if (activeIssue.id) {
          updateIssue.mutate({ id: activeIssue.id, status: updatedStatus, boardOrder: 0 })
        }
      }}
    >
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
        {STATUS_COLUMNS.map((column) => {
          const columnIssues = grouped[column.key] ?? []
          return (
            <KanbanColumn key={column.key} title={column.title} count={columnIssues.length}>
              <SortableContext items={columnIssues.map((issue) => issue.id)} strategy={rectSortingStrategy}>
                {columnIssues.map((issue) => (
                  <SortableIssueCard
                    key={issue.id}
                    id={issue.id}
                    issueKey={issue.issueKey}
                    summary={issue.summary}
                    issueType={issue.issueType}
                    priority={issue.priority}
                    labels={[]}
                    {...(issue.assigneeId ? { assignee: { id: issue.assigneeId, name: 'Assignee' } } : {})}
                    {...(issue.storyPoints !== null && issue.storyPoints !== undefined
                      ? { storyPoints: issue.storyPoints }
                      : {})}
                  />
                ))}
              </SortableContext>
            </KanbanColumn>
          )
        })}
      </Box>

      <DragOverlay>
        {activeIssue ? (
          <Box sx={{ transform: 'scale(1.03)', opacity: 0.95 }}>
            <IssueCard
              issueKey={activeIssue.issueKey}
              summary={activeIssue.summary}
              issueType={activeIssue.issueType}
              priority={activeIssue.priority}
              labels={[]}
              {...(activeIssue.assigneeId ? { assignee: { id: activeIssue.assigneeId, name: 'Assignee' } } : {})}
              {...(activeIssue.storyPoints !== null && activeIssue.storyPoints !== undefined
                ? { storyPoints: activeIssue.storyPoints }
                : {})}
            />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
