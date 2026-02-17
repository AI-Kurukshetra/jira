import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'

export default async function RootPage() {
  const supabase = await createClient()
  const { user } = await requireUser(supabase)

  if (!user) {
    redirect('/login')
  }

  redirect('/projects')
}
