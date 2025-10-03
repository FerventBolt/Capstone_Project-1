'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabase-client'

interface Stats {
  totalUsers: number
  totalCourses: number
  totalCertifications: number
  totalSubmissions: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        // Count users
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
        // Count courses
        const { count: courseCount, error: courseError } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })
        // Count certifications
        const { count: certCount, error: certError } = await supabase
          .from('certifications')
          .select('*', { count: 'exact', head: true })
        // Count certificate submissions
        const { count: subCount, error: subError } = await supabase
          .from('certificate_submissions')
          .select('*', { count: 'exact', head: true })

        if (userError || courseError || certError || subError) {
          setError(
            userError?.message ||
            courseError?.message ||
            certError?.message ||
            subError?.message ||
            'Unknown error'
          )
          setStats(null)
        } else {
          setStats({
            totalUsers: userCount ?? 0,
            totalCourses: courseCount ?? 0,
            totalCertifications: certCount ?? 0,
            totalSubmissions: subCount ?? 0,
          })
        }
      } catch (err: any) {
        setError(err.message || 'Unknown error')
        setStats(null)
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {loading && (
        <div className="text-gray-500">Loading dashboard stats...</div>
      )}
      {error && (
        <div className="text-red-600 mb-4">Error: {error}</div>
      )}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded shadow border border-gray-200 p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-gray-700 mt-2">Total Users</div>
          </div>
          <div className="bg-white rounded shadow border border-gray-200 p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalCourses}</div>
            <div className="text-gray-700 mt-2">Total Courses</div>
          </div>
          <div className="bg-white rounded shadow border border-gray-200 p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalCertifications}</div>
            <div className="text-gray-700 mt-2">Total Certifications</div>
          </div>
          <div className="bg-white rounded shadow border border-gray-200 p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.totalSubmissions}</div>
            <div className="text-gray-700 mt-2">Certificate Submissions</div>
          </div>
        </div>
      )}
    </div>
  )
}