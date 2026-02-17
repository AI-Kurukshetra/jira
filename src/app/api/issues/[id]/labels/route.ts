import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { logger } from '@/lib/logger'
import { logActivity } from '@/lib/services/activity'

interface Params {
  params: Promise<{ id: string }>
}

const labelsSchema = z.object({
  labels: z.array(z.string().min(1)).max(20)
})

export async function POST(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = labelsSchema.safeParse(payload)
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid labels', 400)

  const { data: issue, error: issueError } = await supabase
    .from('issues')
    .select('id, project_id')
    .eq('id', id)
    .single()

  if (issueError || !issue) {
    logger.error({ issueError }, 'Failed to load issue for labels')
    return fail('Failed to update labels', 500)
  }

  const { data: labelRows, error: labelsError } = await supabase
    .from('labels')
    .select('id, name')
    .eq('project_id', issue.project_id)
    .in('name', parsed.data.labels)

  if (labelsError) {
    logger.error({ labelsError }, 'Failed to load labels')
    return fail('Failed to update labels', 500)
  }

  const labelIds = (labelRows ?? []).map((row) => row.id)

  const { error: deleteError } = await supabase.from('issue_labels').delete().eq('issue_id', id)
  if (deleteError) {
    logger.error({ deleteError }, 'Failed to clear labels')
    return fail('Failed to update labels', 500)
  }

  if (labelIds.length > 0) {
    const { error: insertError } = await supabase
      .from('issue_labels')
      .insert(labelIds.map((labelId) => ({ issue_id: id, label_id: labelId })))
    if (insertError) {
      logger.error({ insertError }, 'Failed to insert labels')
      return fail(insertError.message ?? 'Failed to update labels', 500)
    }
  }

  await logActivity(supabase, {
    issueId: id,
    userId: user.id,
    actionType: 'labels_updated',
    newValue: parsed.data.labels.join(', ')
  })

  return ok({ labels: parsed.data.labels })
}
