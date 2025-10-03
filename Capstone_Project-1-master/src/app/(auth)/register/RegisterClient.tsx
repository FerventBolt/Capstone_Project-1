'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/supabase-client'

export default function RegisterClient() {
  const router = useRouter()
  const params = useSearchParams()

  // tokens from the magic‐link
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  const emailVerifyCode = params.get('token')
  const redirectTo = params.get('redirectTo') || '/student/dashboard'

  // form mode: sending link vs finishing signup
  const [mode, setMode] = useState<'signup' | 'complete'>('signup')

  // signup form state
  const [email, setEmail] = useState('')

  // completion form state
  const [fullName, setFullName] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // ❶ Hydrate session on magic‐link, then switch to "complete"
  useEffect(() => {
    async function hydrate() {
      setLoading(true)
      setError('')

      if (accessToken && refreshToken) {
        const { error: sessErr } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (sessErr) {
          console.error('setSession error:', sessErr)
          setError(sessErr.message)
        } else {
          setMode('complete')
        }
      } else if (emailVerifyCode) {
        const { error: codeErr } =
          await supabase.auth.exchangeCodeForSession(emailVerifyCode)
        if (codeErr) {
          console.error('exchangeCodeForSession error:', codeErr)
          setError(codeErr.message)
        } else {
          setMode('complete')
        }
      }

      setLoading(false)
    }

    hydrate()
  }, [accessToken, refreshToken, emailVerifyCode])

  // ❷ Send magic‐link email
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const redirectUrl =
      process.env.NEXT_PUBLIC_REDIRECT_URL ??
      `${window.location.origin}/register`

    const { error: linkErr } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl },
    })

    if (linkErr) {
      console.error('magic link error:', linkErr)
      setError(`Failed to send magic link: ${linkErr.message}`)
    } else {
      setMessage(
        '✅ Magic link sent! Check your inbox, click the link, then finish your profile.'
      )
    }
    setLoading(false)
  }

  // ❸ On completion: set password + insert profile record
  async function handleComplete(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1) get session
    const {
      data: { session },
      error: sessErr,
    } = await supabase.auth.getSession()

    if (sessErr || !session?.user) {
      console.error('getSession error:', sessErr)
      setError(sessErr?.message || 'No active session.')
      setLoading(false)
      return
    }

    // 2) update user's password
    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (updateErr) {
      console.error('updateUser error:', updateErr)
      setError(`Failed to set password: ${updateErr.message}`)
      setLoading(false)
      return
    }

    // 3) insert profile record
    const { error: profileErr } = await supabase
      .from('profiles')
      .insert({
        id: session.user.id,
        full_name: fullName,
        role: 'student',
      })
    if (profileErr) {
      console.error('profile insert error:', profileErr)
      setError(`Failed to save profile: ${profileErr.message}`)
      setLoading(false)
      return
    }

    // 4) all set—redirect to your dashboard
    router.replace(redirectTo)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-xl shadow-lg">
        {mode === 'signup' ? (
          <>
            <h2 className="text-center text-2xl font-bold">Get Your Magic Link</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
            {message && <div className="bg-green-100 text-green-700 p-3 rounded">{message}</div>}
            <form onSubmit={handleSignUp} className="space-y-4">
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
              />
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending link…' : 'Send Magic Link'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-center text-2xl font-bold">Finish Your Profile</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
            <form onSubmit={handleComplete} className="space-y-4">
              <label className="block text-sm font-medium">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field w-full"
              />
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field w-full"
              />
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Completing…' : 'Create Profile'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
