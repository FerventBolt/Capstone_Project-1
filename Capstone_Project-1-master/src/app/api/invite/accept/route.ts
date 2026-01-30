// app/api/invite/accept/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

type Body = {
  inviteId?: string
  email?: string
  password?: string
  role?: string
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body
  const { inviteId, email, password, role } = body

  if (!inviteId) return NextResponse.json({ error: 'Missing inviteId' }, { status: 400 })
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  try {
    // 1) Load invitation row
    const { data: invite, error: inviteErr } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('id', inviteId)
      .maybeSingle()

    if (inviteErr) throw inviteErr
    if (!invite) return NextResponse.json({ error: 'Invalid inviteId' }, { status: 400 })
    if (invite.status !== 'pending') return NextResponse.json({ error: 'Invite is not pending' }, { status: 400 })
    if (invite.email && invite.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Invite email does not match' }, { status: 400 })
    }

    // 2) Check if an auth user already exists for this email
    // Use direct query against auth.users (requires service role)
    let userId: string | null = null

    const { data: authUser, error: authUserErr } = await supabaseAdmin
      .from('auth.users')
      .select('id')
      .ilike('email', email) // case-insensitive match
      .limit(1)
      .maybeSingle()

    if (authUserErr) {
      // If querying auth.users fails, log and continue (we'll create user later if needed)
      console.error('auth.users query error', authUserErr)
    } else if (authUser && (authUser as any).id) {
      userId = (authUser as any).id
    }

    // 3) If user exists: upsert app user role, update invitation
    if (userId) {
      const { error: upsertErr } = await supabaseAdmin
        .from('users')
        .upsert({ id: userId, role: role ?? invite.role }, { onConflict: 'id' })

      if (upsertErr) throw upsertErr

      const { error: invUpdateErr } = await supabaseAdmin
        .from('invitations')
        .update({ status: 'accepted', user_id: userId, accepted_at: new Date().toISOString() })
        .eq('id', inviteId)

      if (invUpdateErr) throw invUpdateErr

      return NextResponse.json({ ok: true, userId })
    }

    // 4) If no auth user exists, optionally create one server-side when password provided
    if (!password) {
      // Optionally reserve the email on the invite or return a note
      const { error: invReservedErr } = await supabaseAdmin
        .from('invitations')
        .update({ reserved_email: email })
        .eq('id', inviteId)

      if (invReservedErr) throw invReservedErr

      return NextResponse.json({ ok: true, note: 'Invite reserved, user must complete signup with password' })
    }

    // 4a) Create auth user using Service Role
    // supabase-js v2 admin method
    const createRes = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { invited_by: invite.invited_by ?? null, invited_with: inviteId },
    })

    if (createRes.error) throw createRes.error
    const newUser = createRes.data.user ?? createRes.data

    if (!newUser || !newUser.id) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // 4b) Upsert app users table with role
    const { error: upsertNewErr } = await supabaseAdmin
      .from('users')
      .upsert({ id: newUser.id, email: email.toLowerCase(), role: role ?? invite.role }, { onConflict: 'id' })

    if (upsertNewErr) throw upsertNewErr

    // 4c) Update invitation row
    const { error: invUpdateNewErr } = await supabaseAdmin
      .from('invitations')
      .update({ status: 'accepted', user_id: newUser.id, accepted_at: new Date().toISOString() })
      .eq('id', inviteId)

    if (invUpdateNewErr) throw invUpdateNewErr

    return NextResponse.json({ ok: true, userId: newUser.id })
  } catch (err: any) {
    console.error('Invite accept error', err)
    const message = err?.message ?? 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
