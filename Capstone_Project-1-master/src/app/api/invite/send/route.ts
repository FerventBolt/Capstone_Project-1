// app/api/invite/send/route.ts
import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, role } = body
    if (!email || !role) {
      return NextResponse.json({ error: 'Missing email or role' }, { status: 400 })
    }

    // 1) Create invitation row using the service role via the REST /rpc or PostgREST endpoint
    // (we use the PostgREST endpoint for your public DB tables)
    const inviteRes = await fetch(`${SUPABASE_URL}/rest/v1/invitations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        email,
        role,
        status: 'pending',
        sent_at: new Date().toISOString(),
      }),
    })

    if (!inviteRes.ok) {
      const text = await inviteRes.text()
      console.error('Create invite row failed', inviteRes.status, text)
      return NextResponse.json({ error: 'Failed to create invite row' }, { status: 500 })
    }

    const invites = await inviteRes.json()
    const invite = Array.isArray(invites) ? invites[0] : invites
    const inviteId = invite?.id
    if (!inviteId) {
      console.error('Invite row returned no id', invite)
      return NextResponse.json({ error: 'Invite created but no id returned' }, { status: 500 })
    }

    // 2) Call Supabase Admin REST to create user and send invite with email_redirect_to and metadata
    // Admin REST endpoint: POST {SUPABASE_URL}/auth/v1/admin/users
    const adminResp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        // do not set password here if you want magic-link invite flow
        user_metadata: { invite_id: inviteId, invited_role: role },
        email_redirect_to: `${NEXT_PUBLIC_BASE_URL.replace(/\/$/, '')}/register`,
      }),
    })

    const adminJson = await adminResp.json().catch(() => ({ ok: false }))
    if (!adminResp.ok) {
      console.error('Admin create user failed', adminResp.status, adminJson)
      // optional: mark invite failed
      await fetch(`${SUPABASE_URL}/rest/v1/invitations?id=eq.${encodeURIComponent(inviteId)}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'expired' }),
      }).catch(() => null)

      const message = adminJson?.message || adminJson?.error || 'Failed to create auth user'
      return NextResponse.json({ error: message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, inviteId, admin: adminJson })
  } catch (err: any) {
    console.error('invite/send error', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
