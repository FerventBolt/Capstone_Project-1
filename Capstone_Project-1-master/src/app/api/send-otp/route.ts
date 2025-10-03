// /app/api/send-invitation/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { code } = await req.json()

  // 1. Find invitation by code
  const { data, error } = await supabase
    .from('invitations')
    .select('email')
    .eq('code', code)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid invitation code.' }, { status: 400 })
  }

  // 2. Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  // 3. Update invitation with OTP
  const { error: updateError } = await supabase
    .from('invitations')
    .update({ otp })
    .eq('code', code)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update OTP.' }, { status: 500 })
  }

  // 4. Send OTP via Outlook SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  })

  try {
    await transporter.sendMail({
      from: `"CTE SkillsHub" <${process.env.SMTP_USER}>`,
      to: data.email,
      subject: 'Your CTE SkillsHub OTP',
      html: `
        <p>Hello,</p>
        <p>Your OTP for CTE SkillsHub registration is:</p>
        <h2>${otp}</h2>
        <p>Enter this code to continue your registration.</p>
        <p>Thank you!</p>
      `
    })

    return NextResponse.json({ message: 'OTP sent successfully.' })
  } catch (mailError) {
    return NextResponse.json({ error: 'Failed to send OTP email.' }, { status: 500 })
  }
}
