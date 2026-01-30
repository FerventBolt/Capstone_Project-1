'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/supabase-client'

type Mode = 'info' | 'email' | 'sent' | 'verifying' | 'error' | 'expired'

export default function RegisterClient() {
  const router = useRouter()
  const params = useSearchParams()

  // Query params
  const inviteToken = params.get('token')
  const urlEmail = params.get('email') || ''
  const urlRole = params.get('role') || 'student'
  const inviteId = params.get('inviteId') || params.get('invite') || null
  const redirectTo = params.get('redirectTo') || '/student/dashboard'

  // Form state
  const [mode, setMode] = useState<Mode>(inviteToken ? 'verifying' : 'info')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState(urlEmail)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Try to set session from URL hash (fragment). Returns true if successful.
  async function trySetSessionFromHash(): Promise<boolean> {
    if (typeof window === 'undefined') return false
    const hash = window.location.hash || ''
    if (!hash) return false
    const paramsHash = new URLSearchParams(hash.replace(/^#/, ''))
    const access_token = paramsHash.get('access_token')
    const refresh_token = paramsHash.get('refresh_token')
    if (!access_token) return false

    const payload: { access_token: string; refresh_token?: string } = { access_token }
    if (refresh_token) payload.refresh_token = refresh_token

    const { error: setErr } = await supabase.auth.setSession(payload as any)
    if (setErr) {
      console.warn('setSession error', setErr)
      return false
    }
    return true
  }

  // Handle magic-link callback
  useEffect(() => {
    if (!inviteToken) return

    // If token present but no email in query, prompt user to enter email first
    if (!urlEmail) {
      console.warn('Token present but no email in query; prompting for email')
      setMode('email')
      return
    }

    setMode('verifying')
    setLoading(true)

    supabase.auth
      .verifyOtp({
        type: 'signup',
        token: inviteToken,
        email: urlEmail,
      })
      .then(async ({ data, error: otpErr }) => {
        if (otpErr) {
          const msg = (otpErr.message || '').toLowerCase()
          if (msg.includes('expired')) setMode('expired')
          else setMode('error')
          setError(otpErr.message)
          return
        }

        // If verifyOtp returned a session, continue
        const returnedSession = (data as any)?.session
        if (returnedSession) {
          await finalizeRegistration()
          return
        }

        // fallback: try to parse tokens from URL hash and set session
        const ok = await trySetSessionFromHash()
        if (ok) {
          await finalizeRegistration()
          return
        }

        // final fallback: check getSession
        const {
          data: { session },
          error: sessErr,
        } = await supabase.auth.getSession()
        if (sessErr || !session) {
          setError('Verification succeeded but no active session was found. Please sign in and try again.')
          setMode('error')
          return
        }

        await finalizeRegistration()
      })
      .catch((err) => {
        console.error('verifyOtp exception', err)
        setError('Unexpected verification error')
        setMode('error')
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteToken, urlEmail])

  // After OTP → set profile → inform server to accept invite → redirect
  async function finalizeRegistration() {
    // Ensure session exists; try getSession and fallback to hash parsing
    let {
      data: { session },
      error: sessErr,
    } = await supabase.auth.getSession()

    if (sessErr) {
      console.warn('getSession returned error', sessErr)
    }

    if (!session) {
      const ok = await trySetSessionFromHash()
      if (ok) {
        const got = await supabase.auth.getSession()
        session = got.data.session
        sessErr = got.error
      }
    }

    if (!session || sessErr) {
      setError(sessErr?.message || 'No active session after verification. Please sign in manually.')
      return setMode('error')
    }

    // If no stored registration info, prompt user to fill it now (Option B)
    const storedName = window.localStorage.getItem('reg_fullName')
    const storedPwd = window.localStorage.getItem('reg_password')
    if (!storedName || !storedPwd) {
      setMode('info')
      setError('Please enter your full name and a password to complete registration.')
      return
    }

    // a) update password
    const { error: pwErr } = await supabase.auth.updateUser({
      password: storedPwd,
    })
    if (pwErr) {
      setError(`Could not set password: ${pwErr.message}`)
      return setMode('error')
    }

    // Refresh session after password update
    const {
      data: { session: sessionAfter },
      error: sessErr2,
    } = await supabase.auth.getSession()
    if (sessErr2 || !sessionAfter) {
      setError(sessErr2?.message || 'Session expired—reload and try again.')
      return setMode('error')
    }

    // c) insert profile
    const user = sessionAfter.user
    const { error: profErr } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email!,
        full_name: storedName,
        role: urlRole,
      })
    if (profErr) {
      setError(`Could not save profile: ${profErr.message}`)
      return setMode('error')
    }

    // d) notify server to accept the invite (server uses SERVICE_ROLE)
    if (inviteId) {
      try {
        const res = await fetch('/api/invite/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inviteId,
            email: user.email,
            role: urlRole,
            userId: user.id,
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          console.error('Invite accept failed', json)
          setError(json?.error || 'Failed to accept invite on server')
          return setMode('error')
        }
      } catch (err: any) {
        console.error('Invite accept error', err)
        setError(err?.message || 'Failed to accept invite on server')
        return setMode('error')
      }
    }

    // e) cleanup & redirect
    window.localStorage.removeItem('reg_fullName')
    window.localStorage.removeItem('reg_password')
    router.replace(redirectTo)
  }

  // Collect name + password
  async function handleInfo(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    window.localStorage.setItem('reg_fullName', fullName)
    window.localStorage.setItem('reg_password', password)

    // If a token is already present and possibly verified, proceed immediately
    if (inviteToken) {
      setMode('verifying')
      setLoading(true)
      try {
        await finalizeRegistration()
      } finally {
        setLoading(false)
      }
      return
    }

    // Normal flow: move to email step to request magic link
    setMode('email')
  }

  // Send magic link to email OR verify token with user-entered email when token present
  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // If a token is already present (user clicked email link without email in query),
    // use the entered email to verify that token immediately.
    if (inviteToken) {
      if (!email) {
        setError('Please enter the email address the invitation was sent to.')
        setLoading(false)
        return
      }

      setMode('verifying')
      const { error: otpErr } = await supabase.auth.verifyOtp({
        type: 'signup',
        token: inviteToken,
        email,
      })

      if (otpErr) {
        const msg = (otpErr.message || '').toLowerCase()
        if (msg.includes('expired')) setMode('expired')
        else setMode('error')
        setError(otpErr.message)
        setLoading(false)
        return
      }

      // try to ensure session
      const ok = await trySetSessionFromHash()
      if (!ok) {
        const got = await supabase.auth.getSession()
        if (!got.data.session) {
          setError('Verified but no session found. Please sign in manually.')
          setMode('error')
          setLoading(false)
          return
        }
      }

      // verified; continue registration
      await finalizeRegistration()
      setLoading(false)
      return
    }

    // Normal flow: request magic link to be sent (no token yet)
    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin
      const callbackUrl = new URL('/register', base) // only the register path
      const { error: linkErr } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callbackUrl.toString() },
      })

      if (linkErr) {
        setError(linkErr.message)
        setMode('error')
      } else {
        setMessage('✅ Check your inbox for the magic link.')
        setMode('sent')
      }
    } catch (err: any) {
      console.error('signInWithOtp error', err)
      setError('Failed to send magic link')
      setMode('error')
    } finally {
      setLoading(false)
    }
  }

  // Render loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent" />
      </div>
    )
  }

  // Main render
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-xl shadow-lg">
        {mode === 'info' && (
          <>
            <h2 className="text-center text-2xl font-bold">Create Your Credentials</h2>
            <div className="bg-blue-50 text-blue-700 p-3 rounded mb-2 text-sm">
              <b>Important:</b> To complete registration, you must use the <b>magic link sent to your email</b>.<br />
              This page is for pre-filling your info only. You cannot register without the magic link.
            </div>
            <form onSubmit={handleInfo} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="input-field w-full"
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field w-full"
              />
              <button type="submit" className="btn-primary w-full">
                {inviteToken ? 'Save and Complete Registration' : 'Next: Enter Email'}
              </button>
            </form>
          </>
        )}

        {mode === 'email' && (
          <>
            <h2 className="text-center text-2xl font-bold">Enter Your Email</h2>
            {inviteToken && (
              <div className="bg-yellow-50 text-yellow-700 p-2 rounded mb-2 text-sm">
                A verification token is present in the URL. Enter the invited email to verify the token and complete registration.
              </div>
            )}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
            {message && <div className="bg-green-100 text-green-700 p-3 rounded">{message}</div>}
            <form onSubmit={handleEmail} className="space-y-4">
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field w-full"
              />
              <button type="submit" className="btn-primary w-full">
                {inviteToken ? 'Verify Token' : 'Send Magic Link'}
              </button>
            </form>
            {inviteId && (
              <div className="text-xs text-gray-600 mt-2">
                Invite ID: <span className="font-mono">{inviteId}</span>
              </div>
            )}
          </>
        )}

        {mode === 'sent' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Link Sent!</h2>
            <p>Go check your inbox to complete registration.</p>
          </div>
        )}

        {mode === 'verifying' && <p className="text-center">Verifying your magic link…</p>}

        {(mode === 'error' || mode === 'expired') && (
          <>
            <h2 className="text-center text-2xl font-bold">
              {mode === 'expired' ? 'Link Expired' : 'Oops—Something Went Wrong'}
            </h2>
            <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>
            {mode === 'expired' && (
              <button onClick={() => setMode('email')} className="btn-primary w-full mt-4">
                Resend Magic Link
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
