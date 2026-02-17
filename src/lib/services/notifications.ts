import type { SupabaseClient } from '@supabase/supabase-js'

import { logger } from '@/lib/logger'

interface NotificationPayload {
  recipientId: string
  type: string
  title: string
  message: string
  relatedIssueId?: string | null
  relatedProjectId?: string | null
}

export async function createNotification(supabase: SupabaseClient, payload: NotificationPayload) {
  const { error } = await supabase.from('notifications').insert({
    recipient_id: payload.recipientId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    related_issue_id: payload.relatedIssueId ?? null,
    related_project_id: payload.relatedProjectId ?? null
  })

  if (error) {
    logger.error({ error, recipientId: payload.recipientId }, 'Failed to create notification')
  }
}
