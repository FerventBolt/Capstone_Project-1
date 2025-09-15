import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(
  process.env.SUPABASE_URL!,  // ensure this is server‑side only
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role, invitedBy } = body;

    if (!email || !role || !invitedBy) {
      return NextResponse.json({ error: 'Missing required field(s)' }, { status: 400 });
    }

    console.log('Invite request:', { email, role, invitedBy });

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sent_at = new Date().toISOString();
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Insert
    const { data: insertData, error: insertError } = await supabase
      .from('invitations')
      .insert([{ code, email, role, invited_by: invitedBy, status: 'pending', sent_at, expires_at }])
      .select();  // maybe select back inserted row for debugging

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json({ error: 'Error inserting invitation', details: insertError.message }, { status: 500 });
    }

    // Setup transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465',  // if 465 use secure
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    // Verify transporter
    await transporter.verify();

    // Send email
    const info = await transporter.sendMail({
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
    });

    console.log('Email send info:', info);

    return NextResponse.json({ message: 'Invitation sent successfully.' });

  } catch (err) {
    console.error('Unhandled error in send-invitation API:', err);
    return NextResponse.json({ error: 'Internal server error', details: (err as Error).message }, { status: 500 });
  }
}
