import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limitParam = searchParams.get('limit')
  const pageParam = searchParams.get('page')
  const pageSizeParam = searchParams.get('pageSize')
  const limit = limitParam ? Number(limitParam) : 20
  const page = pageParam ? Number(pageParam) : null
  const pageSize = pageSizeParam ? Number(pageSizeParam) : null

  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  if (page && pageSize && !Number.isNaN(page) && !Number.isNaN(pageSize)) {
    const query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, error: fetchError, count } = await query.range(from, to)
    if (fetchError) {
      logger.error({ fetchError }, 'Failed to fetch notifications')
      return fail('Failed to fetch notifications', 500)
    }
    return ok({
      items: data ?? [],
      total: count ?? 0,
      page,
      pageSize
    })
  }

  const { data, error: fetchError } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(Number.isNaN(limit) ? 20 : limit)

  if (fetchError) {
    logger.error({ fetchError }, 'Failed to fetch notifications')
    return fail('Failed to fetch notifications', 500)
  }

  return ok(data ?? [])
}
