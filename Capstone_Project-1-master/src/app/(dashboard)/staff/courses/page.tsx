'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabase-client'

interface Course {
  id: string
  title: string
  code: string
  description: string
  category: string
  level: string
  duration: number
  instructor: string
  created_at: string
}

export default function StaffCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) {
        setError(error.message)
        setCourses([])
      } else {
        setCourses(data as Course[])
      }
      setLoading(false)
    }
    fetchCourses()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Courses</h1>
      {loading && (
        <div className="text-gray-500">Loading courses...</div>
      )}
      {error && (
        <div className="text-red-600 mb-4">Error: {error}</div>
      )}
      <div className="bg-white rounded shadow border border-gray-200 mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map(course => (
              <tr key={course.id}>
                <td className="px-4 py-2">{course.title}</td>
                <td className="px-4 py-2">{course.code}</td>
                <td className="px-4 py-2">{course.category}</td>
                <td className="px-4 py-2">{course.level}</td>
                <td className="px-4 py-2">{course.duration}</td>
                <td className="px-4 py-2">{course.instructor}</td>
                <td className="px-4 py-2">{course.created_at ? new Date(course.created_at).toLocaleDateString() : ''}</td>
              </tr>
            ))}
            {(!loading && courses.length === 0) && (
              <tr>
                <td colSpan={7} className="px-4 py-2 text-center text-gray-500">
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}