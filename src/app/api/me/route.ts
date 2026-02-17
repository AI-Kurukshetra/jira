import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { logger } from '@/lib/logger'
import { mapProfileRow } from '@/lib/api/mappers'

export async function GET() {
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    logger.error({ profileError }, 'Failed to fetch profile')
    return fail('Failed to fetch profile', 500)
  }

  return ok({ user, profile: mapProfileRow(profile) })
}
