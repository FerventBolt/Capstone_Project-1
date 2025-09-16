import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

// Use correct env vars for server-side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email, role, invitedBy } = await req.json()

    if (!email || !role || !invitedBy) {
      return NextResponse.json({ error: 'Missing required field(s)' }, { status: 400 })
    }

    // Generate invitation code and timestamps
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const sent_at = new Date().toISOString()
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // Insert invitation row
    const { error: insertError } = await supabase
      .from('invitations')
      .insert([{ code, email, role, invited_by: invitedBy, status: 'pending', sent_at, expires_at }])

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return NextResponse.json({ error: 'Error inserting invitation', details: insertError.message }, { status: 500 })
    }

    // Setup nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    })

    // Send invitation email
    await transporter.sendMail({
      from: `"CTE SkillsHub" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your CTE SkillsHub Invitation Code',
      html: `
        <p>Hello,</p>
        <p>You have been invited to join CTE SkillsHub.</p>
        <p>Your invitation code is:</p>
        <h2>${code}</h2>
        <p>This code will expire in 7 days.</p>
        <p>Thank you!</p>
      `
    })

    return NextResponse.json({ message: 'Invitation sent successfully.' })
  } catch (err: any) {
    console.error('Unhandled error in send-invitation API:', err)
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 })
  }
}
