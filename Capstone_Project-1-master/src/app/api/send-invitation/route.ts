// app/api/invite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin"; // service role client

export async function POST(req: NextRequest) {
  try {
    const { email, role, invitedBy } = await req.json();

    // Step 1: Create user via Supabase Auth
    const { data: user, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { role }
    });

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }

    // Step 2: Insert invitation record into `invitations`
    const { data: invite, error: insertError } = await supabaseAdmin
      .from("invitations")
      .insert({
        email,
        role,
        status: "pending",
        invited_by: invitedBy,
        sent_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, invite, user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
