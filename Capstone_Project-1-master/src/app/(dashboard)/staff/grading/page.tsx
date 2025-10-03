'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabase-client'

interface Assignment {
  id: string
  title: string
  description: string
  due_date: string
  course_id: string
  created_at: string
}

export default function StaffGradingPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAssignments() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('due_date', { ascending: true })
      if (error) {
        setError(error.message)
        setAssignments([])
      } else {
        setAssignments(data as Assignment[])
      }
      setLoading(false)
    }
    fetchAssignments()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Grading</h1>
      {loading && (
        <div className="text-gray-500">Loading assignments...</div>
      )}
      {error && (
        <div className="text-red-600 mb-4">Error: {error}</div>
      )}
      <div className="bg-white rounded shadow border border-gray-200 mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map(assignment => (
              <tr key={assignment.id}>
                <td className="px-4 py-2">{assignment.title}</td>
                <td className="px-4 py-2">{assignment.description}</td>
                <td className="px-4 py-2">{assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : ''}</td>
                <td className="px-4 py-2">{assignment.created_at ? new Date(assignment.created_at).toLocaleDateString() : ''}</td>
              </tr>
            ))}
            {(!loading && assignments.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-2 text-center text-gray-500">
                  No assignments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}