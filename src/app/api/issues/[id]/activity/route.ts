import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { logger } from '@/lib/logger'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const { data, error: fetchError } = await supabase
    .from('activity_logs')
    .select('id, action_type, field_name, old_value, new_value, created_at')
    .eq('issue_id', id)
    .order('created_at', { ascending: false })

  if (fetchError) {
    logger.error({ fetchError }, 'Failed to fetch activity')
    return fail('Failed to fetch activity', 500)
  }

  const mapped = (data ?? []).map((item) => ({
    id: item.id,
    actionType: item.action_type,
    fieldName: item.field_name,
    oldValue: item.old_value,
    newValue: item.new_value,
    createdAt: item.created_at
  }))

  return ok(mapped)
}
