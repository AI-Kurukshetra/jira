'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import { CreateIssueModal } from '@/components/issues/CreateIssueModal'

interface CreateIssueContextValue {
  openCreateIssue: (projectId?: string) => void
}

const CreateIssueContext = createContext<CreateIssueContextValue | null>(null)

export function useCreateIssue() {
  const context = useContext(CreateIssueContext)
  if (!context) {
    throw new Error('useCreateIssue must be used within CreateIssueProvider')
  }
  return context
}

interface CreateIssueProviderProps {
  children: ReactNode
}

export function CreateIssueProvider({ children }: CreateIssueProviderProps) {
  const [open, setOpen] = useState(false)
  const [defaultProjectId, setDefaultProjectId] = useState<string | undefined>(undefined)

  const value = useMemo<CreateIssueContextValue>(
    () => ({
      openCreateIssue: (projectId?: string) => {
        setDefaultProjectId(projectId)
        setOpen(true)
      }
    }),
    []
  )

  return (
    <CreateIssueContext.Provider value={value}>
      {children}
      <CreateIssueModal
        open={open}
        onClose={() => setOpen(false)}
        {...(defaultProjectId ? { defaultProjectId } : {})}
      />
    </CreateIssueContext.Provider>
  )
}
