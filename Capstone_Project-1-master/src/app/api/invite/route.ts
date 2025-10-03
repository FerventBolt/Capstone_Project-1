// app/api/invite/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { email, role } = await req.json()

  if (!email || !role) {
    return NextResponse.json(
      { error: 'Missing email or role' },
      { status: 400 }
    )
  }

  // 1) Send the invite email
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: inviteData, error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { role },
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    })
  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 })
  }

  // 2) Mirror into your invitations table
  const newUserId = inviteData.user?.id ?? null
  const now = new Date().toISOString()
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error: insertError } = await supabaseAdmin
    .from('invitations')
    .insert([
      {
        email,
        role,
        status: 'pending',
        user_id: newUserId,
        sent_at: now,
        expires_at: expires,
      },
    ])

  if (insertError) {
    console.error('Failed to insert invitation record:', insertError)
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, invitation: inviteData })
}
