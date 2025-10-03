'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabase-client'

interface Stats {
  enrolledCourses: number
  completedLessons: number
  certificationsEarned: number
}

export default function StudentDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error('Not authenticated')

        // Count enrolled courses
        const { count: enrolledCount, error: enrolledError } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user.id)
        // Count completed lessons
        const { count: completedCount, error: completedError } = await supabase
          .from('lesson_progress')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user.id)
          .eq('completed', true)
        // Count certifications earned
        const { count: certCount, error: certError } = await supabase
          .from('certificate_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user.id)
          .eq('status', 'approved')

        if (enrolledError || completedError || certError) {
          setError(
            enrolledError?.message ||
            completedError?.message ||
            certError?.message ||
            'Unknown error'
          )
          setStats(null)
        } else {
          setStats({
            enrolledCourses: enrolledCount ?? 0,
            completedLessons: completedCount ?? 0,
            certificationsEarned: certCount ?? 0,
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
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
      {loading && (
        <div className="text-gray-500">Loading dashboard stats...</div>
      )}
      {error && (
        <div className="text-red-600 mb-4">Error: {error}</div>
      )}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded shadow border border-gray-200 p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-green-600">{stats.enrolledCourses}</div>
            <div className="text-gray-700 mt-2">Enrolled Courses</div>
          </div>
          <div className="bg-white rounded shadow border border-gray-200 p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-600">{stats.completedLessons}</div>
            <div className="text-gray-700 mt-2">Completed Lessons</div>
          </div>
          <div className="bg-white rounded shadow border border-gray-200 p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-purple-600">{stats.certificationsEarned}</div>
            <div className="text-gray-700 mt-2">Certifications Earned</div>
          </div>
        </div>
      )}
    </div>
  )
}