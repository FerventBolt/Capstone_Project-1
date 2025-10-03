'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/supabase-client'

interface Assignment {
  id: string
  title: string
  description: string
  due_date: string
  course_id: string
  created_at: string
}

interface Submission {
  id: string
  assignment_id: string
  student_id: string
  status: string
  grade: number | null
  submitted_at: string
}

export default function StaffGradingAssignmentPage() {
  const { id } = useParams<{ id: string }>()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAssignmentAndSubmissions() {
      setLoading(true)
      setError(null)
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', id)
        .single()
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .eq('assignment_id', id)
        .order('submitted_at', { ascending: true })

      if (assignmentError) {
        setError(assignmentError.message)
        setAssignment(null)
      } else {
        setAssignment(assignmentData as Assignment)
      }
      if (submissionsError) {
        setSubmissions([])
      } else {
        setSubmissions(submissionsData as Submission[])
      }
      setLoading(false)
    }
    if (id) fetchAssignmentAndSubmissions()
  }, [id])

  return (
    <div className="p-6">
      {loading && <div className="text-gray-500">Loading assignment...</div>}
      {error && <div className="text-red-600 mb-4">Error: {error}</div>}
      {assignment && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{assignment.title}</h1>
          <div className="text-gray-700 mb-1">Due Date: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : ''}</div>
          <div className="mt-2 text-gray-600">{assignment.description}</div>
        </div>
      )}
      <div className="bg-white rounded shadow border border-gray-200 mt-4">
        <h2 className="text-xl font-semibold px-4 py-2 border-b border-gray-200">Submissions</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map(sub => (
              <tr key={sub.id}>
                <td className="px-4 py-2">{sub.student_id}</td>
                <td className="px-4 py-2">{sub.status}</td>
                <td className="px-4 py-2">{sub.grade ?? '—'}</td>
                <td className="px-4 py-2">{sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : ''}</td>
              </tr>
            ))}
            {(!loading && submissions.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-2 text-center text-gray-500">
                  No submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}