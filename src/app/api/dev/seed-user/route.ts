import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

import { logger } from '@/lib/logger'

interface SeedPayload {
  email: string
  password: string
  fullName: string
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ data: null, error: 'Not allowed' }, { status: 403 })
  }

  const payload = (await request.json()) as SeedPayload
  if (!payload?.email || !payload?.password || !payload?.fullName) {
    return NextResponse.json({ data: null, error: 'Missing fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    { auth: { persistSession: false } }
  )

  const { data, error } = await supabase.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    email_confirm: true,
    user_metadata: { full_name: payload.fullName }
  })

  if (error) {
    logger.error({ error }, 'Seed user failed')
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, error: null })
}
