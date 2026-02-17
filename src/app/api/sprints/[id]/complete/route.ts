import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { logger } from '@/lib/logger'

interface Params {
  params: Promise<{ id: string }>
}

const completeSchema = z.object({
  moveToSprintId: z.string().uuid().nullable().optional()
})

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = completeSchema.safeParse(payload)
  if (!parsed.success) return fail(parsed.error.message, 400)

  const { data: sprint, error: sprintError } = await supabase
    .from('sprints')
    .select('id, project_id, status')
    .eq('id', id)
    .single()

  if (sprintError || !sprint) {
    logger.error({ sprintError }, 'Failed to load sprint')
    return fail('Failed to load sprint', 500)
  }

  if (sprint.status !== 'active') {
    return fail('Sprint is not active', 400)
  }

  if (parsed.data.moveToSprintId) {
    const { data: target, error: targetError } = await supabase
      .from('sprints')
      .select('id, status, project_id')
      .eq('id', parsed.data.moveToSprintId)
      .single()

    if (targetError || !target) {
      return fail('Target sprint not found', 400)
    }

    if (target.project_id !== sprint.project_id || target.status !== 'pending') {
      return fail('Invalid target sprint', 400)
    }
  }

  const nextSprintId = parsed.data.moveToSprintId ?? null

  const { error: issueError } = await supabase
    .from('issues')
    .update({ sprint_id: nextSprintId })
    .eq('sprint_id', id)
    .neq('status', 'done')

  if (issueError) {
    logger.error({ issueError }, 'Failed to move incomplete issues')
    return fail('Failed to move incomplete issues', 500)
  }

  const { data: updated, error: updateError } = await supabase
    .from('sprints')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (updateError || !updated) {
    logger.error({ updateError }, 'Failed to complete sprint')
    return fail('Failed to complete sprint', 500)
  }

  return ok(updated)
}
