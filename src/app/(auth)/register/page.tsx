'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from 'C:/CapstoneProject/Capstone_Project-main/src/lib/supabase/supabase-client'
import axios from 'axios'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    invitationCode: '',
    otp: '',
    firstName: '',
    lastName: '',
    middleName: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: ''
  })
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [invitationData, setInvitationData] = useState<any>(null)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Step 1: Validate invitation code and send OTP via API
  const handleInvitationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.invitationCode.trim()) {
      setError('Invitation code is required.')
      setLoading(false)
      return
    }

    // Check if invitation code exists
    const { data, error: supaError } = await supabase
      .from('invitations')
      .select('*')
      .eq('code', formData.invitationCode.trim())
      .single()

    if (supaError || !data) {
      setError('Invalid invitation code. Please check and try again.')
      setLoading(false)
      return
    }

    // Send OTP via API (server generates and emails OTP)
    try {
      const res = await axios.post('/api/send-otp', {
        code: formData.invitationCode.trim()
      })
      if (res.status === 200) {
        setInvitationData({
          email: data.email,
          role: data.role,
          invitedBy: data.invited_by
        })
        setStep(2)
      } else {
        setError(res.data?.error || 'Failed to send OTP. Try again.')
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to send OTP. Try again.')
    }
    setLoading(false)
  }

  // Step 2: OTP validation
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Fetch invitation with code and OTP
    const { data, error: supaError } = await supabase
      .from('invitations')
      .select('otp')
      .eq('code', formData.invitationCode.trim())
      .single()

    if (supaError || !data) {
      setError('Could not verify code. Try again.')
    } else if (formData.otp.trim() === String(data.otp).trim()) {
      setStep(3)
    } else {
      setError('Invalid OTP. Please check your email and try again.')
    }
    setLoading(false)
  }

  // Resend OTP handler
  const handleResendOTP = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/send-otp', {
        code: formData.invitationCode.trim()
      })
      if (res.status === 200) {
        setError('A new verification code has been sent to your email.')
      } else {
        setError(res.data?.error || 'Failed to resend verification code.')
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to resend verification code.')
    }
    setLoading(false)
  }

  // Step 3: Register user in Supabase
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.')
      setLoading(false)
      return
    }

    try {
      const { error: userError } = await supabase
        .from('profiles')
        .insert([{
          email: invitationData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          middle_name: formData.middleName,
          phone_number: formData.phoneNumber,
          date_of_birth: formData.dateOfBirth,
          address: formData.address,
          role: invitationData.role,
          invited_by: invitationData.invitedBy
        }])

      if (userError) {
        setError('Failed to create account. Please try again.')
      } else {
        router.push('/login?message=Registration successful. Please sign in.')
      }
    } catch (err) {
      setError('Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join CTE SkillsHub with your invitation</p>
            {/* Progress indicator */}
            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>1</div>
                <div className={`w-8 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>2</div>
                <div className={`w-8 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>3</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Invitation Code */}
          {step === 1 && (
            <form onSubmit={handleInvitationSubmit} className="space-y-6">
              <div>
                <label htmlFor="invitationCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Invitation Code
                </label>
                <input
                  id="invitationCode"
                  name="invitationCode"
                  type="text"
                  required
                  value={formData.invitationCode}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter your invitation code"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the invitation code sent to your email
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Validating...' : 'Validate Invitation'}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  We've sent a 6-digit code to <strong>{invitationData?.email}</strong>
                </p>
              </div>

              <form onSubmit={handleOTPSubmit} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="input-field text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <button
                  type="button"
                  className="w-full text-sm text-blue-600 hover:text-blue-500"
                  disabled={loading}
                  onClick={handleResendOTP}
                >
                  Resend verification code
                </button>
              </form>
            </div>
          )}

          {/* Step 3: Profile Setup */}
          {step === 3 && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-2">
                  Middle Name
                </label>
                <input
                  id="middleName"
                  name="middleName"
                  type="text"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="+639123456789"
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Complete address"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}