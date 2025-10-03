'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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

interface Lesson {
  id: string
  course_id: string
  title: string
  description: string
  content: string
  duration: number
  created_at: string
}

export default function StudentCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCourseAndLessons() {
      setLoading(true)
      setError(null)
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true })

      if (courseError) {
        setError(courseError.message)
        setCourse(null)
      } else {
        setCourse(courseData as Course)
      }
      if (lessonsError) {
        setLessons([])
      } else {
        setLessons(lessonsData as Lesson[])
      }
      setLoading(false)
    }
    if (courseId) fetchCourseAndLessons()
  }, [courseId])

  return (
    <div className="p-6">
      {loading && <div className="text-gray-500">Loading course details...</div>}
      {error && <div className="text-red-600 mb-4">Error: {error}</div>}
      {course && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <div className="text-gray-700 mb-1">Code: {course.code}</div>
          <div className="text-gray-700 mb-1">Category: {course.category}</div>
          <div className="text-gray-700 mb-1">Level: {course.level}</div>
          <div className="text-gray-700 mb-1">Duration: {course.duration} hours</div>
          <div className="text-gray-700 mb-1">Instructor: {course.instructor}</div>
          <div className="text-gray-700 mb-1">Created: {course.created_at ? new Date(course.created_at).toLocaleDateString() : ''}</div>
          <div className="mt-2 text-gray-600">{course.description}</div>
        </div>
      )}
      <div className="bg-white rounded shadow border border-gray-200 mt-4">
        <h2 className="text-xl font-semibold px-4 py-2 border-b border-gray-200">Lessons</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lessons.map(lesson => (
              <tr key={lesson.id}>
                <td className="px-4 py-2">{lesson.title}</td>
                <td className="px-4 py-2">{lesson.description}</td>
                <td className="px-4 py-2">{lesson.duration} hours</td>
                <td className="px-4 py-2">{lesson.created_at ? new Date(lesson.created_at).toLocaleDateString() : ''}</td>
              </tr>
            ))}
            {(!loading && lessons.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-2 text-center text-gray-500">
                  No lessons found for this course.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}