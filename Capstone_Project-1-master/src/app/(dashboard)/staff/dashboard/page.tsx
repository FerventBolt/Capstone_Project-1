'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabase-client'

interface Stats {
  totalCourses: number
  totalStudents: number
  totalAssignments: number
  totalLessons: number
}

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        const { count: courseCount, error: courseError } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })
        const { count: studentCount, error: studentError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student')
        const { count: assignmentCount, error: assignmentError } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true })
        const { count: lessonCount, error: lessonError } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })

        if (courseError || studentError || assignmentError || lessonError) {
          setError(
            courseError?.message ||
            studentError?.message ||
            assignmentError?.message ||
            lessonError?.message ||
            'Unknown error'
          )
          setStats(null)
        } else {
          setStats({
            totalCourses: courseCount ?? 0,
            totalStudents: studentCount ?? 0,
            totalAssignments: assignmentCount ?? 0,
            totalLessons: lessonCount ?? 0,
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
      <h1 className="text-3xl font-bold mb-6">Staff Dashboard</h1>
      {loading && (
        <div className="text-gray-500">Loading dashboard stats...</div>
      )}
      {error && (
        <div className="text-red-600 mb-4">Error: {error}</div>
      )}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded shadow border border-gray-200 p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalCourses}</div>
            <div className="text-gray-700 mt-2">Total Courses</div>
          </div>
          <div className="bg-white rounded shadow border border-gray-200 p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
            <div className="text-gray-700 mt-2">Total Students</div>
          </div>
          <div className="bg-white rounded shadow border border-gray-200 p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalAssignments}</div>
            <div className="text-gray-700 mt-2">Total Assignments</div>
          </div>
          <div className="bg-white rounded shadow border border-gray-200 p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.totalLessons}</div>
            <div className="text-gray-700 mt-2">Total Lessons</div>
          </div>
        </div>
      )}
    </div>
  )
}