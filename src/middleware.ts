import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check for demo session cookie (temporary solution for demo accounts)
  const demoSession = request.cookies.get('demo-session')
  let sessionData = null
  let isAuthenticated = false

  if (demoSession?.value) {
    try {
      const decodedValue = decodeURIComponent(demoSession.value)
      sessionData = JSON.parse(decodedValue)
      isAuthenticated = !!sessionData?.authenticated
    } catch (error) {
      // Silent error handling for invalid session data
    }
  }

  // Define protected routes
  const protectedRoutes = ['/admin', '/staff', '/student']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // If accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated user tries to access auth pages, redirect to appropriate dashboard
  if (isAuthenticated && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    // Get user role from demo session
    const userRole = sessionData?.role || 'admin'
    const dashboardUrl = new URL(`/${userRole}/dashboard`, request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}