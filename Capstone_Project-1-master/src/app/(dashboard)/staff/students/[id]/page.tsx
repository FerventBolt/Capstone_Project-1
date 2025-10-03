'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/supabase-client'

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

export default function StaffStudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      if (error) {
        setError(error.message)
        setProfile(null)
      } else {
        setProfile(data as Profile)
      }
      setLoading(false)
    }
    if (id) fetchProfile()
  }, [id])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Student Details</h1>
      {loading && <div className="text-gray-500">Loading student...</div>}
      {error && <div className="text-red-600 mb-4">Error: {error}</div>}
      {profile && (
        <div className="bg-white rounded shadow border border-gray-200 p-6 max-w-md">
          <div className="mb-4">
            <div className="font-semibold">Full Name:</div>
            <div>{profile.full_name}</div>
          </div>
          <div className="mb-4">
            <div className="font-semibold">Email:</div>
            <div>{profile.email}</div>
          </div>
          <div className="mb-4">
            <div className="font-semibold">Role:</div>
            <div>{profile.role}</div>
          </div>
          <div className="mb-4">
            <div className="font-semibold">Created:</div>
            <div>{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}</div>
          </div>
        </div>
      )}
    </div>
  )
}