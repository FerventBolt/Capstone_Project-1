// app/api/invitations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!

// SDK client for table ops + initial deleteUser attempt
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY)

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  // 1) Look up the invitation & its user_id
  const { data: invite, error: fetchErr } = await supabaseAdmin
    .from('invitations')
    .select('user_id')
    .eq('id', id)
    .single()

  if (fetchErr || !invite) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
  }

  const userId = invite.user_id

  // 2) Delete the invitation row first
  const { error: delInviteErr } = await supabaseAdmin
    .from('invitations')
    .delete()
    .eq('id', id)

  if (delInviteErr) {
    console.error('Failed to delete invitation record:', delInviteErr.message)
    return NextResponse.json(
      { error: 'Could not delete invitation' },
      { status: 500 }
    )
  }

  // 3) Now delete the Auth user (no more FK constraint)
  if (userId) {
    // try SDK first
    const { error: sdkErr } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (sdkErr) {
      console.warn('SDK deleteUser failed, falling back to REST:', sdkErr.message)
      const url = SUPABASE_URL.replace(/\/$/, '') +
        `/auth/v1/admin/users/${userId}`
      const restRes = await fetch(url, {
        method: 'DELETE',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
      })
      if (!restRes.ok) {
        const details = await restRes.text()
        console.error(`REST deleteUser failed [${restRes.status}]:`, details)
        return NextResponse.json(
          { error: 'Failed to delete auth user', details },
          { status: 500 }
        )
      }
    }
  }

  return NextResponse.json({ success: true })
}
