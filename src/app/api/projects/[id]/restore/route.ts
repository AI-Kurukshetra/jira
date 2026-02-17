import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { logger } from '@/lib/logger'

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(_request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const { data, error: updateError } = await supabase
    .from('projects')
    .update({ status: 'active', deleted_at: null })
    .eq('id', id)
    .select('*')
    .single()

  if (updateError || !data) {
    logger.error({ updateError }, 'Failed to restore project')
    return fail('Failed to restore project', 500)
  }

  return ok(data)
}
