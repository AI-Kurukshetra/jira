'use client'

import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { Box } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { KanbanColumn } from '@/components/board/KanbanColumn'
import { IssueCard } from '@/components/issues/IssueCard'
import { SortableIssueCard } from '@/components/board/SortableIssueCard'
import { apiPatch } from '@/lib/api/client'
import type { IssueStatus, BoardColumn } from '@/lib/types'
import type { IssueWithAssignee } from '@/lib/hooks/useIssues'
import type { Issue } from '@/lib/types'

interface KanbanBoardProps {
  initialIssues?: IssueWithAssignee[]
  columns: BoardColumn[]
  onAddIssue?: (columnId: string) => void
  projectKey?: string
}

export function KanbanBoard({ initialIssues = [], columns, onAddIssue, projectKey }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [issues, setIssues] = useState<IssueWithAssignee[]>(initialIssues)
  const queryClient = useQueryClient()

  useEffect(() => {
    setIssues(initialIssues)
  }, [initialIssues])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const updateIssue = useMutation({
    mutationFn: async ({ id, status, boardOrder, columnId }: { id: string; status: IssueStatus; boardOrder: number; columnId: string }) => {
      const result = await apiPatch<Issue, Partial<Issue>>(`/api/issues/${id}`, {
        status,
        boardOrder,
        columnId
      })
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['issues'] })
      const previous = queryClient.getQueryData<IssueWithAssignee[]>(['issues'])
      if (previous) {
        queryClient.setQueryData<IssueWithAssignee[]>(['issues'], (current) => {
          if (!current) return current
          return current.map((issue) =>
            issue.id === payload.id
              ? {
                  ...issue,
                  status: payload.status as Issue['status'],
                  boardOrder: payload.boardOrder,
                  columnId: payload.columnId
                }
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
      queryClient.setQueryData<IssueWithAssignee[]>(['issues'], (current) => {
        if (!current) return current
        return current.map((issue) => (issue.id === data.id ? data : issue))
      })
    }
  })

  const columnsById = useMemo(() => new Map(columns.map((column) => [column.id, column])), [columns])

  const columnsByStatus = useMemo(() => {
    const map: Record<IssueStatus, BoardColumn[]> = {
      todo: [],
      inprogress: [],
      done: []
    }
    for (const column of columns) {
      map[column.status].push(column)
    }
    return map
  }, [columns])

  const resolveColumnId = useCallback(
    (issue: IssueWithAssignee) => {
      if (issue.columnId && columnsById.has(issue.columnId)) return issue.columnId
      const fallback = columnsByStatus[issue.status]?.[0]?.id ?? columns[0]?.id
      return fallback
    },
    [columns, columnsById, columnsByStatus]
  )

  const grouped = useMemo(() => {
    const map: Record<string, IssueWithAssignee[]> = {}
    for (const column of columns) {
      map[column.id] = []
    }
    for (const issue of issues) {
      const columnId = resolveColumnId(issue)
      if (columnId && map[columnId]) {
        map[columnId]?.push({ ...issue, columnId })
      }
    }
    return map
  }, [issues, columns, resolveColumnId])

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
        if (!activeIssue) return

        const overIssue = issues.find((issue) => issue.id === overIdValue)
        const overColumn = columnsById.get(overIdValue)

        const targetColumnId = overColumn?.id ?? (overIssue ? resolveColumnId(overIssue) : undefined)
        if (!targetColumnId) return

        const targetColumn = columnsById.get(targetColumnId)
        const updatedStatus = (targetColumn?.status ?? activeIssue.status) as IssueStatus

        const sourceColumnId = resolveColumnId(activeIssue)
        if (!sourceColumnId) return

        setIssues((current) => {
          const sourceList = [...(grouped[sourceColumnId] ?? [])]
          const targetList = sourceColumnId === targetColumnId ? sourceList : [...(grouped[targetColumnId] ?? [])]

          const activeIndex = sourceList.findIndex((issue) => issue.id === activeIdValue)
          if (activeIndex === -1) return current

          const [movedIssue] = sourceList.splice(activeIndex, 1)
          if (!movedIssue) return current
          const insertionIndex =
            overIssue && overIssue.id !== activeIdValue
              ? targetList.findIndex((issue) => issue.id === overIssue.id)
              : targetList.length

          const insertAt = insertionIndex === -1 ? targetList.length : insertionIndex
          targetList.splice(insertAt, 0, movedIssue)

          const updatedById = new Map<string, IssueWithAssignee>()
          sourceList.forEach((issue, index) => {
            updatedById.set(issue.id, { ...issue, boardOrder: index, columnId: sourceColumnId })
          })
          targetList.forEach((issue, index) => {
            updatedById.set(issue.id, {
              ...issue,
              boardOrder: index,
              columnId: targetColumnId,
              status: updatedStatus
            })
          })

          return current.map((issue) => updatedById.get(issue.id) ?? issue)
        })

        updateIssue.mutate({ id: activeIssue.id, status: updatedStatus, boardOrder: 0, columnId: targetColumnId })
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
        {columns.map((column) => {
          const columnIssues = grouped[column.id] ?? []
          return (
            <KanbanColumn
              key={column.id}
              columnId={column.id}
              title={column.name}
              count={columnIssues.length}
              {...(onAddIssue ? { onAdd: () => onAddIssue(column.id) } : {})}
            >
              <SortableContext items={columnIssues.map((issue) => issue.id)} strategy={rectSortingStrategy}>
                {columnIssues.map((issue) => (
                  <SortableIssueCard
                    key={issue.id}
                    id={issue.id}
                    issueKey={issue.issueKey}
                    summary={issue.summary}
                    issueType={issue.issueType}
                    priority={issue.priority}
                    labels={issue.labels ?? []}
                    {...(projectKey ? { href: `/projects/${projectKey}/issues/${issue.issueKey}` } : {})}
                    {...(issue.assignee
                      ? {
                          assignee: {
                            id: issue.assigneeId ?? issue.id,
                            name: issue.assignee.displayName ?? issue.assignee.fullName ?? 'Assignee'
                          }
                        }
                      : {})}
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
              labels={activeIssue.labels ?? []}
              {...(activeIssue.assignee
                ? {
                    assignee: {
                      id: activeIssue.assigneeId ?? activeIssue.id,
                      name: activeIssue.assignee.displayName ?? activeIssue.assignee.fullName ?? 'Assignee'
                    }
                  }
                : {})}
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
