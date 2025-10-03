'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/supabase-client'

interface Lesson {
  id: string
  course_id: string
  title: string
  description: string
  content: string
  duration: number
  created_at: string
}

export default function StudentLessonDetailPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLesson() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('course_id', courseId)
        .single()
      if (error) {
        setError(error.message)
        setLesson(null)
      } else {
        setLesson(data as Lesson)
      }
      setLoading(false)
    }
    if (courseId && lessonId) fetchLesson()
  }, [courseId, lessonId])

  return (
    <div className="p-6">
      {loading && <div className="text-gray-500">Loading lesson...</div>}
      {error && <div className="text-red-600 mb-4">Error: {error}</div>}
      {lesson && (
        <div>
          <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
          <div className="text-gray-700 mb-1">Duration: {lesson.duration} hours</div>
          <div className="text-gray-700 mb-1">Created: {lesson.created_at ? new Date(lesson.created_at).toLocaleDateString() : ''}</div>
          <div className="mt-2 text-gray-600">{lesson.description}</div>
          <div className="mt-4 bg-gray-50 p-4 rounded">{lesson.content}</div>
        </div>
      )}
    </div>
  )
}