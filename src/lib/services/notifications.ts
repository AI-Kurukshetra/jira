import type { SupabaseClient } from '@supabase/supabase-js'

import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { buildNotificationEmail } from '@/lib/email/templates'

interface NotificationPrefs {
  email?: boolean
  inApp?: boolean
  assignments?: boolean
  statusChanges?: boolean
  comments?: boolean
  mentions?: boolean
}

interface NotificationPayload {
  recipientId: string
  type: string
  title: string
  message: string
  relatedIssueId?: string | null
  relatedProjectId?: string | null
}

const shouldSendForType = (prefs: NotificationPrefs | null, type: string) => {
  if (!prefs) return true
  if (type === 'issue_assigned') return prefs.assignments ?? true
  if (type === 'status_changed') return prefs.statusChanges ?? true
  if (type === 'comment_added') return prefs.comments ?? true
  if (type === 'mention') return prefs.mentions ?? true
  return true
}

export async function createNotification(supabase: SupabaseClient, payload: NotificationPayload) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('notification_prefs, is_active')
    .eq('id', payload.recipientId)
    .single()

  if (profileError) {
    logger.error({ profileError }, 'Failed to load notification prefs')
    return
  }

  if (profile?.is_active === false) {
    return
  }

  const prefs = (profile?.notification_prefs ?? null) as NotificationPrefs | null
  const inAppEnabled = prefs?.inApp ?? true
  const emailEnabled = prefs?.email ?? true
  const typeAllowed = shouldSendForType(prefs, payload.type)

  if (inAppEnabled) {
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

  if (emailEnabled && typeAllowed) {
    try {
      const admin = createAdminClient()
      const { data, error: userError } = await admin.auth.admin.getUserById(payload.recipientId)
      if (userError || !data.user?.email) {
        logger.error({ userError }, 'Failed to resolve user email')
        return
      }
      const { subject, html, text } = buildNotificationEmail({
        title: payload.title,
        message: payload.message
      })
      await sendEmail({
        to: data.user.email,
        subject,
        html,
        text
      })
    } catch (error) {
      logger.error({ error }, 'Email notification failed')
    }
  }

}
