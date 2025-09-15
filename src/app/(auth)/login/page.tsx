'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'

// Fix for Next.js 14 Link component TypeScript issues
const Link = NextLink as any

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Check if this is a demo account
      const isDemoAdmin = email === 'admin@lpu.edu.ph' && password === 'admin123'
      const isDemoStaff = email === 'instructor@lpu.edu.ph' && password === 'staff123'
      const isDemoStudent = email === 'student@lpunetwork.edu.ph' && password === 'student123'
      
      if (isDemoAdmin || isDemoStaff || isDemoStudent) {
        // Determine user role and create session data
        let userRole = 'admin'
        let userEmail = email
        let userName = 'Admin User'
        
        if (isDemoStaff) {
          userRole = 'staff'
          userName = 'Staff User'
        }
        if (isDemoStudent) {
          userRole = 'student'
          userName = 'Student User'
        }
        
        // Create demo session data
        const sessionData = {
          role: userRole,
          email: userEmail,
          name: userName,
          authenticated: true,
          loginTime: new Date().toISOString()
        }
        
        // Set demo session cookie with proper encoding
        const cookieValue = encodeURIComponent(JSON.stringify(sessionData))
        document.cookie = `demo-session=${cookieValue}; path=/; max-age=86400; SameSite=Lax`
        
        // Determine redirect URL
        const redirectUrl = `/${userRole}/dashboard`
        
        // Clear form
        setEmail('')
        setPassword('')
        
        // Force immediate redirect to trigger middleware
        window.location.replace(redirectUrl)
        
      } else {
        setError('Invalid credentials. Please use one of the demo accounts shown below.')
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600 mb-8">Access your CTE SkillsHub account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your institutional email"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use your @lpu.edu.ph (staff) or @lpunetwork.edu.ph (student) email
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                Register with invitation code
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-4">Demo Accounts:</p>
              <div className="space-y-2 text-xs">
                <div className="demo-account-box">
                  <strong>Admin:</strong> admin@lpu.edu.ph / admin123
                </div>
                <div className="demo-account-box">
                  <strong>Staff:</strong> instructor@lpu.edu.ph / staff123
                </div>
                <div className="demo-account-box">
                  <strong>Student:</strong> student@lpunetwork.edu.ph / student123
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}