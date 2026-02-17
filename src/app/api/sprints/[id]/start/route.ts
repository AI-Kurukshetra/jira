import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { logger } from '@/lib/logger'
import { createNotification } from '@/lib/services/notifications'

interface Params {
  params: Promise<{ id: string }>
}

const startSchema = z.object({
  startDate: z.string().date(),
  endDate: z.string().date()
})

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = startSchema.safeParse(payload)
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

  if (sprint.status === 'active') {
    return fail('Sprint is already active', 400)
  }

  const { data: activeSprint, error: activeError } = await supabase
    .from('sprints')
    .select('id')
    .eq('project_id', sprint.project_id)
    .eq('status', 'active')
    .maybeSingle()

  if (activeError) {
    logger.error({ activeError }, 'Failed to check active sprint')
    return fail('Failed to check active sprint', 500)
  }

  if (activeSprint) {
    return fail('Another sprint is already active', 400)
  }

  const { data: updated, error: updateError } = await supabase
    .from('sprints')
    .update({
      status: 'active',
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate
    })
    .eq('id', id)
    .select('*')
    .single()

  if (updateError || !updated) {
    logger.error({ updateError }, 'Failed to start sprint')
    return fail('Failed to start sprint', 500)
  }

  const { data: members } = await supabase
    .from('project_members')
    .select('user_id')
    .eq('project_id', sprint.project_id)

  await Promise.all(
    (members ?? [])
      .map((member) => member.user_id)
      .filter((memberId): memberId is string => Boolean(memberId) && memberId !== user.id)
      .map((memberId) =>
        createNotification(supabase, {
          recipientId: memberId,
          type: 'sprint_started',
          title: `Sprint started`,
          message: `${updated.name} is now active.`,
          relatedProjectId: sprint.project_id,
          relatedIssueId: null
        })
      )
  )

  return ok(updated)
}
