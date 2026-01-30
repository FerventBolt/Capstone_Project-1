// pages/api/invite.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase keys (never expose these in the browser)
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed – use POST to send invites.' })
  }

  const { email, role = 'student' } = req.body as { email?: string; role?: string }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid email' })
  }

  try {
    // Build the /register redirect URL that will be embedded into the magic-link
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000')
    const registerUrl = new URL('/register', baseUrl)
    registerUrl.searchParams.set('role', role)
    registerUrl.searchParams.set('email', email)

    const redirectTo = registerUrl.toString()
    console.log('📨 [invite] redirectTo →', redirectTo)

    // Send the invite; Supabase will include redirectTo as redirect_to in the verify URL
    const { data: inviteData, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { role },
    })

    if (inviteErr) {
      console.error('❌ [invite] inviteUserByEmail failed:', inviteErr.message)
      return res.status(500).json({ success: false, error: inviteErr.message })
    }

    const invitedUser = inviteData.user!
    console.log('✅ [invite] invitedUser.id →', invitedUser.id)

    // Persist the invitation record (non-fatal)
    const { error: dbErr } = await supabaseAdmin.from('invitations').insert({
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

    // Return server-built preview URL plus Supabase invite data for debugging
    return res.status(200).json({
      success: true,
      user: invitedUser,
      inviteUrl: redirectTo,   // preview: where the magic link should return the user
      inviteData: inviteData,  // raw Supabase response (no token included)
    })
  } catch (err: any) {
    console.error('❌ [invite] unexpected error:', err)
    return res.status(500).json({ success: false, error: err.message || 'Unknown error' })
  }
}
