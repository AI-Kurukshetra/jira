import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { timeEntrySchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'
import { logActivity } from '@/lib/services/activity'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const { data, error: fetchError } = await supabase
    .from('time_entries')
    .select('*')
    .eq('issue_id', id)
    .order('work_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (fetchError) {
    logger.error({ fetchError }, 'Failed to fetch time entries')
    return fail('Failed to fetch time entries', 500)
  }

  const mapped = (data ?? []).map((entry) => ({
    id: entry.id,
    issueId: entry.issue_id,
    userId: entry.user_id,
    workDate: entry.work_date,
    minutes: entry.minutes,
    description: entry.description ?? null,
    createdAt: entry.created_at,
    updatedAt: entry.updated_at
  }))

  return ok(mapped)
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = timeEntrySchema.safeParse({ ...payload, issueId: id })
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? parsed.error.message, 400)

  const { data, error: insertError } = await supabase
    .from('time_entries')
    .insert({
      issue_id: id,
      user_id: user.id,
      work_date: parsed.data.workDate,
      minutes: parsed.data.minutes,
      description: parsed.data.description ?? null
    })
    .select('*')
    .single()

  if (insertError || !data) {
    logger.error({ insertError }, 'Failed to log time')
    return fail('Failed to log time', 500)
  }

  await logActivity(supabase, {
    issueId: id,
    userId: user.id,
    actionType: 'time_logged',
    newValue: String(parsed.data.minutes)
  })

  return ok(
    {
      id: data.id,
      issueId: data.issue_id,
      userId: data.user_id,
      workDate: data.work_date,
      minutes: data.minutes,
      description: data.description ?? null,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    },
    201
  )
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const entryId = typeof payload?.id === 'string' ? payload.id : null
  if (!entryId) return fail('Missing entry id', 400)

  const { data, error: deleteError } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', entryId)
    .eq('issue_id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (deleteError || !data) {
    logger.error({ deleteError }, 'Failed to delete time entry')
    return fail('Failed to delete time entry', 500)
  }

  return ok({ id: entryId })
}
