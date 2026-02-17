import type { SupabaseClient, User } from '@supabase/supabase-js'

import { logger } from '@/lib/logger'

export async function requireUser(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    logger.warn({ error }, 'Unauthorized request')
    return { user: null, error: 'Unauthorized' }
  }
  return { user: data.user as User, error: null }
}
