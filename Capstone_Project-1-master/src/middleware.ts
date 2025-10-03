// middleware.ts

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

// ✅ Use a private var name so this never leaks to the client bundle
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function middleware(req: NextRequest) {
  try {
    const { pathname, search } = req.nextUrl

    // 0. Bypass Next internals and API routes
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon.ico") ||
      pathname.startsWith("/api")
    ) {
      return NextResponse.next()
    }

    const isAuthRoute =
      pathname.startsWith("/login") || pathname.startsWith("/register")
    const isRoot = pathname === "/"

    // 1. Read Supabase access token from cookie
    const token = req.cookies.get("sb-access-token")?.value

    // 2. Verify token & get user
    let userId: string | null = null
    if (token) {
      const { data, error } = await supabaseAdmin.auth.getUser(token)
      if (!error && data.user) {
        userId = data.user.id
      }
    }

    // 3. Redirect unauthenticated users → /login
    if (!userId && !isAuthRoute) {
      const redirectTo = encodeURIComponent(pathname + search)
      return NextResponse.redirect(
        new URL(`/login?redirectTo=${redirectTo}`, req.url)
      )
    }

    // 4. Block logged-in users from seeing /login or /register
    if (userId && isAuthRoute) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // 5. Role-based redirect from “/”
    if (userId && isRoot) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single()

      switch (profile?.role) {
        case "admin":
          return NextResponse.redirect(new URL("/admin/dashboard", req.url))
        case "student":
          return NextResponse.redirect(new URL("/student/dashboard", req.url))
        case "staff":
          return NextResponse.redirect(new URL("/staff/dashboard", req.url))
      }
    }

    return NextResponse.next()
  } catch (err) {
    console.error("🚨 Middleware Error:", err)
    return new NextResponse("Internal middleware error", { status: 500 })
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
}
