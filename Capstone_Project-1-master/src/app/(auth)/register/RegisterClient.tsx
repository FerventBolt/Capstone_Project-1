'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/supabase-client'

type Mode = 'signup' | 'complete' | 'expired' | 'error'

export default function RegisterClient() {
  const router = useRouter()
  const params = useSearchParams()

  // URL params
  const inviteToken = params.get('token')
  const invitedEmail = params.get('email') || ''
  const redirectTo    = params.get('redirectTo') || '/student/dashboard'

  // UI state
  const [mode, setMode]       = useState<Mode>('signup')
  const [email, setEmail]     = useState(invitedEmail)
  const [fullName, setFullName]     = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!inviteToken) return

    setLoading(true)
    setError('')

    // 1) Look for tokens in hash (magic-link flow)
    const hash        = window.location.hash.substring(1)
    const hashParams  = new URLSearchParams(hash)
    const accessToken = hashParams.get('access_token')
    const refreshToken= hashParams.get('refresh_token')

    if (accessToken && refreshToken) {
      // hydrate session manually
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error: sessErr }) => {
          if (sessErr) {
            setError(sessErr.message)
            setMode('error')
          } else {
            setMode('complete')
          }
        })
        .finally(() => {
          // scrub hash so we don't re-run on re-render
          window.history.replaceState(
            null,
            '',
            window.location.pathname + window.location.search
          )
          setLoading(false)
        })

      return
    }

    // 2) No tokens in hash → call verifyOtp manually
    supabase.auth
      .verifyOtp({
        type: 'signup',
        token: inviteToken,
        email: invitedEmail,
      })
      .then(({ error: otpErr }) => {
        if (otpErr) {
          const msg = otpErr.message.toLowerCase()
          if (msg.includes('expired')) {
            setError('This link has expired.')
            setMode('expired')
          } else {
            setError(otpErr.message)
            setMode('error')
          }
        } else {
          setMode('complete')
        }
      })
      .finally(() => {
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search
        )
        setLoading(false)
      })
  }, [inviteToken, invitedEmail])

  // Phase 1: send magic link
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const emailRedirectTo = `${
      process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin
    }/register?token={{token}}&redirectTo=${encodeURIComponent(
      redirectTo
    )}&email=${encodeURIComponent(email)}`

    const { error: linkErr } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo },
    })

    if (linkErr) {
      setError(`Failed to send magic link: ${linkErr.message}`)
      setMode('error')
    } else {
      setMessage(
        '✅ Check your inbox for the magic link, then return here to complete your profile.'
      )
    }
    setLoading(false)
  }

  // Phase 2: set password + profile
  async function handleComplete(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // set new password
    const { error: pwErr } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (pwErr) {
      setError(`Could not set password: ${pwErr.message}`)
      setMode('error')
      setLoading(false)
      return
    }

    // retrieve session
    const {
      data: { session },
      error: sessErr,
    } = await supabase.auth.getSession()

    if (sessErr || !session) {
      setError(sessErr?.message || 'Session expired—please reload.')
      setMode('error')
      setLoading(false)
      return
    }

    // insert profile
    const user = session.user
    const { error: profErr } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email!,
      full_name: fullName,
      role: params.get('role') || 'student',
    })

    if (profErr) {
      setError(`Could not save profile: ${profErr.message}`)
      setMode('error')
      setLoading(false)
      return
    }

    // success → redirect
    router.replace(redirectTo)
  }

  // Phase 3: resend invite when expired
  async function handleResend() {
    if (!invitedEmail) {
      setError('No email to resend invite to.')
      setMode('error')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    const emailRedirectTo = `${
      process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin
    }/register?token={{token}}&redirectTo=${encodeURIComponent(
      redirectTo
    )}&email=${encodeURIComponent(invitedEmail)}`

    const { error: resendErr } = await supabase.auth.signInWithOtp({
      email: invitedEmail,
      options: { emailRedirectTo },
    })

    if (resendErr) {
      setError(`Could not resend invite: ${resendErr.message}`)
      setMode('error')
    } else {
      setMessage('✅ New invite link sent—check your inbox.')
      setMode('signup')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="animate-spin w-12 h-12 border-4 border-blue-600
                     rounded-full border-t-transparent"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-xl shadow-lg">
        {mode === 'signup' && (
          <>
            <h2 className="text-center text-2xl font-bold">
              Get Your Magic Link
            </h2>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-100 text-green-700 p-3 rounded">
                {message}
              </div>
            )}
            <form onSubmit={handleSignUp} className="space-y-4">
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field w-full"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Sending…' : 'Send Magic Link'}
              </button>
            </form>
          </>
        )}

        {mode === 'complete' && (
          <>
            <h2 className="text-center text-2xl font-bold">
              Finish Your Profile
            </h2>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleComplete} className="space-y-4">
              <label className="block text-sm font-medium">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="input-field w-full"
              />
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="input-field w-full"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Completing…' : 'Create Profile'}
              </button>
            </form>
          </>
        )}

        {mode === 'expired' && (
          <>
            <h2 className="text-center text-2xl font-bold">Link Expired</h2>
            <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>
            <button
              onClick={handleResend}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Sending…' : 'Resend Invite Link'}
            </button>
          </>
        )}

        {mode === 'error' && (
          <>
            <h2 className="text-center text-2xl font-bold">
              Something’s Wrong
            </h2>
            <div className="bg-red-100 text-red-700 p-3 rounded">
              {error || 'An unexpected error occurred.'}
            </div>
          </>
        )}
      </div>
    </div>
  )
}