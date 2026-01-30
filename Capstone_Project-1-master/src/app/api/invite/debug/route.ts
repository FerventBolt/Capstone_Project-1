import { NextResponse } from 'next/server'
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: Request) {
  const body = await req.json()
  const { email, role } = body

  // create invite row
  const inviteRes = await fetch(`${SUPABASE_URL}/rest/v1/invitations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ email, role, status: 'pending', sent_at: new Date().toISOString() }),
  })
  const inviteJson = await inviteRes.json().catch(() => null)

  // create admin user
  const adminResp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      user_metadata: { invite_id: inviteJson?.[0]?.id ?? inviteJson?.id },
      email_redirect_to: `${process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '')}/register`,
    }),
  })
  const adminJson = await adminResp.json().catch(() => null)

  return NextResponse.json({ invite: inviteJson, admin: adminJson })
}
