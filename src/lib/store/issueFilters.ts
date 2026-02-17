'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { IssueFilters } from '@/lib/types/filters'
import type { IssuePriority, IssueStatus, IssueType } from '@/lib/types'

interface IssueFilterState {
  filtersByProject: Record<string, IssueFilters>
  setFilters: (projectId: string, update: Partial<IssueFilters>) => void
  resetFilters: (projectId: string) => void
}

const DEFAULT_FILTERS: IssueFilters = {
  query: '',
  assigneeIds: [],
  reporterIds: [],
  issueTypes: [],
  priorities: [],
  statuses: [],
  labels: [],
  sprintFilter: 'all',
  sprintId: undefined,
  dueDateFrom: undefined,
  dueDateTo: undefined,
  myOnly: false
}

export const useIssueFilterStore = create<IssueFilterState>()(
  persist(
    (set, get) => ({
      filtersByProject: {},
      setFilters: (projectId, update) => {
        const current = get().filtersByProject[projectId] ?? DEFAULT_FILTERS
        const next: IssueFilters = {
          ...current,
          ...update,
          assigneeIds: update.assigneeIds ?? current.assigneeIds,
          reporterIds: update.reporterIds ?? current.reporterIds,
          issueTypes: update.issueTypes ?? current.issueTypes,
          priorities: update.priorities ?? current.priorities,
          statuses: update.statuses ?? current.statuses,
          labels: update.labels ?? current.labels,
          sprintFilter: update.sprintFilter ?? current.sprintFilter,
          sprintId: update.sprintId ?? current.sprintId,
          dueDateFrom: update.dueDateFrom ?? current.dueDateFrom,
          dueDateTo: update.dueDateTo ?? current.dueDateTo
        }
        set((state) => ({
          filtersByProject: { ...state.filtersByProject, [projectId]: next }
        }))
      },
      resetFilters: (projectId) => {
        set((state) => ({
          filtersByProject: { ...state.filtersByProject, [projectId]: DEFAULT_FILTERS }
        }))
      }
    }),
    {
      name: 'issue-filters'
    }
  )
)

export function useIssueFilters(projectId: string) {
  const raw = useIssueFilterStore((state) => state.filtersByProject[projectId])
  const filters = {
    ...DEFAULT_FILTERS,
    ...(raw ?? {}),
    assigneeIds: raw?.assigneeIds ?? DEFAULT_FILTERS.assigneeIds,
    reporterIds: raw?.reporterIds ?? DEFAULT_FILTERS.reporterIds,
    issueTypes: raw?.issueTypes ?? DEFAULT_FILTERS.issueTypes,
    priorities: raw?.priorities ?? DEFAULT_FILTERS.priorities,
    statuses: raw?.statuses ?? DEFAULT_FILTERS.statuses,
    labels: raw?.labels ?? DEFAULT_FILTERS.labels
  }
  const setFilters = useIssueFilterStore((state) => state.setFilters)
  const resetFilters = useIssueFilterStore((state) => state.resetFilters)
  return {
    filters,
    setFilters: (update: Partial<IssueFilters>) => setFilters(projectId, update),
    resetFilters: () => resetFilters(projectId)
  }
}

export function toggleFilterValue<T extends IssueType | IssueStatus | IssuePriority | string>(
  values: T[],
  value: T
) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
}
