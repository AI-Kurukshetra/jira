import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { attachmentSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'
import { logActivity } from '@/lib/services/activity'

interface Params {
  params: Promise<{ id: string }>
}

const attachmentDeleteSchema = z.object({
  attachmentId: z.string().uuid()
})

export async function POST(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = attachmentSchema.safeParse({ ...payload, issueId: id })
  if (!parsed.success) return fail(parsed.error.message, 400)

  const { data, error: insertError } = await supabase
    .from('attachments')
    .insert({
      issue_id: id,
      uploader_id: user.id,
      file_name: parsed.data.fileName,
      file_size: parsed.data.fileSize ?? null,
      file_type: parsed.data.fileType ?? null,
      storage_path: parsed.data.storagePath
    })
    .select('*')
    .single()

  if (insertError || !data) {
    logger.error({ insertError }, 'Failed to add attachment')
    return fail('Failed to add attachment', 500)
  }

  await logActivity(supabase, {
    issueId: id,
    userId: user.id,
    actionType: 'attachment_added'
  })

  return ok(data, 201)
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = attachmentDeleteSchema.safeParse(payload)
  if (!parsed.success) return fail(parsed.error.message, 400)

  const { data, error: deleteError } = await supabase
    .from('attachments')
    .delete()
    .eq('id', parsed.data.attachmentId)
    .eq('issue_id', id)
    .select('*')
    .single()

  if (deleteError || !data) {
    logger.error({ deleteError }, 'Failed to delete attachment')
    return fail('Failed to delete attachment', 500)
  }

  await logActivity(supabase, {
    issueId: id,
    userId: user.id,
    actionType: 'attachment_removed'
  })

  return ok(data)
}
