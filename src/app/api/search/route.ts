import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { searchSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') ?? ''
  const projectId = searchParams.get('projectId') ?? undefined
  const scope = (searchParams.get('scope') ?? 'project') as 'project' | 'all'

  const parsed = searchSchema.safeParse({ query, projectId, scope })
  if (!parsed.success) return fail(parsed.error.message, 400)

  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const issueQuery = supabase
    .from('issues')
    .select('id, issue_key, summary, project_id, description, project:projects(key)')
    .or(`summary.ilike.%${parsed.data.query}%,description.ilike.%${parsed.data.query}%`)
    .order('created_at', { ascending: false })
    .limit(10)

  const projectQuery = supabase
    .from('projects')
    .select('id, name, key')
    .ilike('name', `%${parsed.data.query}%`)
    .order('created_at', { ascending: false })
    .limit(5)

  if (parsed.data.projectId && parsed.data.scope === 'project') {
    issueQuery.eq('project_id', parsed.data.projectId)
    projectQuery.eq('id', parsed.data.projectId)
  }

  const [issuesResult, projectsResult] = await Promise.all([issueQuery, projectQuery])

  if (issuesResult.error || projectsResult.error) {
    logger.error({ issuesError: issuesResult.error, projectsError: projectsResult.error }, 'Search failed')
    return fail('Search failed', 500)
  }

  return ok({ issues: issuesResult.data ?? [], projects: projectsResult.data ?? [] })
}
