'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()

  // Grab Supabase’s verify params
  const token       = params.get('token')
  const type        = params.get('type')
  const email       = params.get('email')
  const rawRedirect = params.get('redirect_to') || params.get('redirectTo') || '/'

  useEffect(() => {
    // Build a query string for /register
    const qs = new URLSearchParams()
    if (token)       qs.set('token', token)
    if (type)        qs.set('type', type)
    if (email)       qs.set('email', email)
    if (rawRedirect) qs.set('redirectTo', rawRedirect)

    // Redirect straight into your register page
    router.replace(`/register?${qs.toString()}`)
  }, [router, token, type, email, rawRedirect])

  return null
}
