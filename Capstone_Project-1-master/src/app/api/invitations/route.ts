// app/api/invitations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { data, error } = await supabaseAdmin
    .from('invitations')
    .select(`
      id,
      email,
      role,
      status,
      sent_at,
      expires_at,
      user_id,
      accepted_at
    `)
    .order('sent_at', { ascending: false })

  if (error) {
    console.error('Error fetching invitations:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
