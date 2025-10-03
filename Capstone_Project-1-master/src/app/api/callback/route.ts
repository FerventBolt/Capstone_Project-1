// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body.record; // Supabase sends "record" with user info

    // Mark invitation as accepted
    await supabaseAdmin
      .from("invitations")
      .update({
        status: "accepted"
      })
      .eq("email", email);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
