import type { ReactNode } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { PageTransition } from '@/components/ui/PageTransition'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AppShell>
      <PageTransition>{children}</PageTransition>
    </AppShell>
  )
}
