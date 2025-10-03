'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabase-client'

interface Progress {
  course_id: string
  course_title: string
  completed_lessons: number
  total_lessons: number
}

export default function StudentProgressPage() {
  const [progress, setProgress] = useState<Progress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true)
      setError(null)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Not authenticated')
        setProgress([])
        setLoading(false)
        return
      }
      // Get all courses the student is enrolled in
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id)
      if (enrollmentsError) {
        setError(enrollmentsError.message)
        setProgress([])
        setLoading(false)
        return
      }
      // For each course, get progress
      const progressArr: Progress[] = []
      for (const enrollment of enrollments as { course_id: string }[]) {
        // Get course info
        const { data: course } = await supabase
          .from('courses')
          .select('title')
          .eq('id', enrollment.course_id)
          .single()
        // Get total lessons
        const { count: totalLessons } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', enrollment.course_id)
        // Get completed lessons
        const { count: completedLessons } = await supabase
          .from('lesson_progress')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user.id)
          .eq('course_id', enrollment.course_id)
          .eq('completed', true)
        progressArr.push({
          course_id: enrollment.course_id,
          course_title: course?.title ?? '',
          completed_lessons: completedLessons ?? 0,
          total_lessons: totalLessons ?? 0,
        })
      }
      setProgress(progressArr)
      setLoading(false)
    }
    fetchProgress()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Progress</h1>
      {loading && <div className="text-gray-500">Loading progress...</div>}
      {error && <div className="text-red-600 mb-4">Error: {error}</div>}
      <div className="bg-white rounded shadow border border-gray-200 mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {progress.map((p) => (
              <tr key={p.course_id}>
                <td className="px-4 py-2">{p.course_title}</td>
                <td className="px-4 py-2">
                  {p.completed_lessons} / {p.total_lessons} lessons completed
                </td>
              </tr>
            ))}
            {(!loading && progress.length === 0) && (
              <tr>
                <td colSpan={2} className="px-4 py-2 text-center text-gray-500">
                  No progress found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}