import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { sprintSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'
import { mapSprintRow } from '@/lib/api/mappers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  let queryBuilder = supabase.from('sprints').select('*').order('created_at', { ascending: false })
  if (projectId) queryBuilder = queryBuilder.eq('project_id', projectId)

  const { data, error: fetchError } = await queryBuilder

  if (fetchError) {
    logger.error({ fetchError }, 'Failed to fetch sprints')
    return fail('Failed to fetch sprints', 500)
  }

  const mapped = (data ?? []).map((sprint) => mapSprintRow(sprint))
  return ok(mapped)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = sprintSchema.safeParse(payload)
  if (!parsed.success) return fail(parsed.error.message, 400)

  const { data, error: insertError } = await supabase
    .from('sprints')
    .insert({
      project_id: parsed.data.projectId,
      name: parsed.data.name,
      goal: parsed.data.goal ?? null,
      status: parsed.data.status ?? 'pending',
      start_date: parsed.data.startDate ?? null,
      end_date: parsed.data.endDate ?? null,
      created_by: user.id
    })
    .select('*')
    .single()

  if (insertError || !data) {
    logger.error({ insertError }, 'Failed to create sprint')
    return fail('Failed to create sprint', 500)
  }

  return ok(mapSprintRow(data), 201)
}
