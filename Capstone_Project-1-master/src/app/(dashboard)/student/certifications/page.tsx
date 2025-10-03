'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabase-client'

interface Certification {
  id: string
  name: string
  code: string
  description: string
  type: string
  duration_hours: number
  prerequisites: string
  created_at: string
}

interface Submission {
  id: string
  certificate_id: string
  status: string
  remarks: string
  submitted_at: string
}

export default function StudentCertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCertsAndSubmissions() {
      setLoading(true)
      setError(null)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Not authenticated')
        setCertifications([])
        setSubmissions([])
        setLoading(false)
        return
      }
      // Fetch all certifications
      const { data: certs, error: certsError } = await supabase
        .from('certifications')
        .select('*')
        .order('created_at', { ascending: false })
      // Fetch student's submissions
      const { data: subs, error: subsError } = await supabase
        .from('certificate_submissions')
        .select('*')
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false })

      if (certsError || subsError) {
        setError(certsError?.message || subsError?.message || 'Unknown error')
        setCertifications([])
        setSubmissions([])
      } else {
        setCertifications(certs as Certification[])
        setSubmissions(subs as Submission[])
      }
      setLoading(false)
    }
    fetchCertsAndSubmissions()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Certifications</h1>
      {loading && <div className="text-gray-500">Loading certifications...</div>}
      {error && <div className="text-red-600 mb-4">Error: {error}</div>}
      <div className="bg-white rounded shadow border border-gray-200 mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Certification</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((sub) => {
              const cert = certifications.find(c => c.id === sub.certificate_id)
              return (
                <tr key={sub.id}>
                  <td className="px-4 py-2">{cert ? cert.name : 'Unknown'}</td>
                  <td className="px-4 py-2">{sub.status}</td>
                  <td className="px-4 py-2">{sub.remarks}</td>
                  <td className="px-4 py-2">{sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : ''}</td>
                </tr>
              )
            })}
            {(!loading && submissions.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-2 text-center text-gray-500">
                  No certifications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}