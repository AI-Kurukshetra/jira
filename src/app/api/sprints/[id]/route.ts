import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { sprintSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'
import { mapSprintRow } from '@/lib/api/mappers'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const { data, error: fetchError } = await supabase.from('sprints').select('*').eq('id', id).single()

  if (fetchError) {
    logger.error({ fetchError }, 'Failed to fetch sprint')
    return fail('Failed to fetch sprint', 500)
  }

  return ok(mapSprintRow(data))
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = sprintSchema.partial().safeParse(payload)
  if (!parsed.success) return fail(parsed.error.message, 400)

  const { data, error: updateError } = await supabase
    .from('sprints')
    .update({
      name: parsed.data.name,
      goal: parsed.data.goal,
      status: parsed.data.status,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      completed_at: parsed.data.status === 'completed' ? new Date().toISOString() : undefined
    })
    .eq('id', id)
    .select('*')
    .single()

  if (updateError || !data) {
    logger.error({ updateError }, 'Failed to update sprint')
    return fail('Failed to update sprint', 500)
  }

  return ok(mapSprintRow(data))
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const { error: deleteError } = await supabase.from('sprints').delete().eq('id', id)

  if (deleteError) {
    logger.error({ deleteError }, 'Failed to delete sprint')
    return fail('Failed to delete sprint', 500)
  }

  return ok({ id })
}
