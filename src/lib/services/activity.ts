import type { SupabaseClient } from '@supabase/supabase-js'

import { logger } from '@/lib/logger'

interface ActivityPayload {
  issueId: string
  userId: string | null
  actionType: string
  fieldName?: string
  oldValue?: string | null
  newValue?: string | null
}

export async function logActivity(supabase: SupabaseClient, payload: ActivityPayload) {
  const { error } = await supabase.from('activity_logs').insert({
    issue_id: payload.issueId,
    user_id: payload.userId,
    action_type: payload.actionType,
    field_name: payload.fieldName ?? null,
    old_value: payload.oldValue ?? null,
    new_value: payload.newValue ?? null
  })

  if (error) {
    logger.error({ error, issueId: payload.issueId }, 'Failed to write activity log')
  }
}
