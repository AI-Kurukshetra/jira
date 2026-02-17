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

  const { count, error: countError } = await supabase
    .from('issue_watchers')
    .select('*', { head: true, count: 'exact' })
    .eq('issue_id', id)

  if (countError) {
    logger.error({ countError }, 'Failed to count watchers')
    return fail('Failed to fetch watchers', 500)
  }

  const { data: watcher, error: watchError } = await supabase
    .from('issue_watchers')
    .select('issue_id')
    .eq('issue_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (watchError) {
    logger.error({ watchError }, 'Failed to fetch watch status')
    return fail('Failed to fetch watch status', 500)
  }

  return ok({ watching: Boolean(watcher), count: count ?? 0 })
}

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const { error: insertError } = await supabase
    .from('issue_watchers')
    .insert({ issue_id: id, user_id: user.id })

  if (insertError && insertError.code !== '23505') {
    logger.error({ insertError }, 'Failed to watch issue')
    return fail('Failed to watch issue', 500)
  }

  return ok({ watching: true })
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const { error: deleteError } = await supabase
    .from('issue_watchers')
    .delete()
    .eq('issue_id', id)
    .eq('user_id', user.id)

  if (deleteError) {
    logger.error({ deleteError }, 'Failed to unwatch issue')
    return fail('Failed to unwatch issue', 500)
  }

  return ok({ watching: false })
}
