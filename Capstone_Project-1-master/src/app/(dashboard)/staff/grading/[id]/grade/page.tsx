'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/supabase-client'

interface Submission {
  id: string
  assignment_id: string
  student_id: string
  status: string
  grade: number | null
  submitted_at: string
}

export default function StaffGradeSubmissionPage() {
  const { id } = useParams<{ id: string }>()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [grade, setGrade] = useState<number | ''>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSubmission() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .single()
      if (error) {
        setError(error.message)
        setSubmission(null)
      } else {
        setSubmission(data as Submission)
        setGrade(data?.grade ?? '')
      }
      setLoading(false)
    }
    if (id) fetchSubmission()
  }, [id])

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    const { error } = await supabase
      .from('submissions')
      .update({ grade: grade === '' ? null : Number(grade), status: 'graded' })
      .eq('id', id)
    if (error) {
      setError(error.message)
      setSuccess(null)
    } else {
      setSuccess('Grade updated successfully!')
    }
    setLoading(false)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Grade Submission</h1>
      {loading && <div className="text-gray-500">Loading submission...</div>}
      {error && <div className="text-red-600 mb-4">Error: {error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}
      {submission && (
        <form onSubmit={handleGrade} className="bg-white rounded shadow border border-gray-200 p-6 max-w-md">
          <div className="mb-4">
            <div className="font-semibold">Student ID:</div>
            <div>{submission.student_id}</div>
          </div>
          <div className="mb-4">
            <div className="font-semibold">Assignment ID:</div>
            <div>{submission.assignment_id}</div>
          </div>
          <div className="mb-4">
            <div className="font-semibold">Submitted:</div>
            <div>{submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : ''}</div>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-2">Grade</label>
            <input
              type="number"
              value={grade}
              onChange={e => setGrade(e.target.value === '' ? '' : Number(e.target.value))}
              className="input-field"
              min={0}
              max={100}
              required
            />
          </div>
          <button type="submit" className="btn-primary">Save Grade</button>
        </form>
      )}
    </div>
  )
}