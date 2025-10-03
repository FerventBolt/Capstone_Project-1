
import { NextResponse } from "next/server";

export async function POST() {
  const cookies = [
    "sb-access-token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
    "sb-refresh-token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
  ].join("; ");

  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", cookies);
  return res;
}
