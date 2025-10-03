'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/supabase-client'

interface CertificationApplication {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  certificationType: string
  courseId: string
  courseTitle: string
  applicationDate: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  reviewedBy?: string
  reviewedAt?: string
  documents: any[]
  notes: string
}

export default function CertificationApplicationsPage() {
  const [applications, setApplications] = useState<CertificationApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true)
      setError(null)

      const { data: apps, error: fetchError } = await supabase
        .from('certificate_applications')
        .select(`
          id,
          student_id,
          certification_type,
          course_id,
          application_date,
          status,
          reviewed_by,
          reviewed_at,
          notes,
          student_profile:profiles!fk_certapp_student(
            id,
            full_name,
            email
          ),
          course_detail:courses!certificate_applications_course_id_fkey(
            id,
            title
          )
        `)
        .order('application_date', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        setApplications([])
      } else {
        setApplications(
          (apps || []).map((app: any) => ({
            id: app.id,
            studentId: app.student_id,
            studentName: app.student_profile?.full_name ?? '',
            studentEmail: app.student_profile?.email ?? '',
            certificationType: app.certification_type,
            courseId: app.course_id,
            courseTitle: app.course_detail?.title ?? '',
            applicationDate: app.application_date,
            status: app.status,
            reviewedBy: app.reviewed_by,
            reviewedAt: app.reviewed_at,
            documents: [],
            notes: app.notes,
          }))
        )
      }

      setLoading(false)
    }

    fetchApplications()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Certification Applications</h1>
      {loading && <div className="text-gray-500">Loading applications...</div>}
      {error && <div className="text-red-600 mb-4">Error: {error}</div>}

      <div className="bg-white rounded shadow border border-gray-200 mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Certification Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map(app => (
              <tr key={app.id}>
                <td className="px-4 py-2">{app.studentName}</td>
                <td className="px-4 py-2">{app.studentEmail}</td>
                <td className="px-4 py-2">{app.certificationType}</td>
                <td className="px-4 py-2">{app.courseTitle}</td>
                <td className="px-4 py-2">
                  {app.applicationDate
                    ? new Date(app.applicationDate).toLocaleDateString()
                    : ''}
                </td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 rounded ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-4 py-2">{app.notes}</td>
              </tr>
            ))}
            {!loading && applications.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-2 text-center text-gray-500">
                  No certification applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
