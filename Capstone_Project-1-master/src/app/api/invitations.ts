// pages/api/invite.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// ← Must be your Supabase project URL, *not* NEXT_PUBLIC_BASE_URL
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { email, role } = req.body as { email: string; role: string }

  // 1) Build & log your /register callback URL
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'
  const invitePageUrl = new URL('/register', baseUrl)
  invitePageUrl.searchParams.set('redirectTo', '/student/dashboard')
  invitePageUrl.searchParams.set('email', email)
  const redirectTo = invitePageUrl.toString()
  console.log('📨 [invite] redirectTo =', redirectTo)

  // 2) Call GoTrue’s invite endpoint with our custom redirect
  const { data: inviteData, error: inviteErr } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { role },
    })

  if (inviteErr) {
    console.error('❌ [invite] inviteUserByEmail error:', inviteErr.message)
    return res.status(500).json({ error: inviteErr.message })
  }

  const invitedUser = inviteData.user!
  console.log('✅ [invite] invitedUser.id =', invitedUser.id)

  // 3) Persist into your invitations table
  const { error: dbErr } = await supabaseAdmin
    .from('invitations')
    .insert({
      id: invitedUser.id,
      email,
      role,
      status: 'pending',
      sent_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

  if (dbErr) {
    console.error('❌ [invite] invitations.insert error:', dbErr.message)
  }

  // 4) Return the user and the URL your client can preview
  return res.status(200).json({
    user: invitedUser,
    inviteUrl: redirectTo,
  })
}
