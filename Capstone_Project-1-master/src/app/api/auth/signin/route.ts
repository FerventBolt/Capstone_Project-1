// /app/api/auth/signin/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { serialize } from "cookie";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return NextResponse.json(
      { error: error?.message ?? "Login failed" },
      { status: 401 }
    );
  }

  // set tokens in HTTP-only cookies
  const { access_token, refresh_token } = data.session;
  const cookies = [
    serialize("sb-access-token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    }),
    serialize("sb-refresh-token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    }),
  ].join("; ");

  // fetch the user's role from your profiles table
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = profile?.role;

  // return both user and role
  const res = NextResponse.json({ user: data.user, role });
  res.headers.set("Set-Cookie", cookies);
  return res;
}
