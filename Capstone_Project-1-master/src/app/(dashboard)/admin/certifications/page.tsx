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

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCertifications() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) {
        setError(error.message)
        setCertifications([])
      } else {
        setCertifications(data as Certification[])
      }
      setLoading(false)
    }
    fetchCertifications()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Certifications</h1>
      {loading && (
        <div className="text-gray-500">Loading certifications...</div>
      )}
      {error && (
        <div className="text-red-600 mb-4">Error: {error}</div>
      )}
      <div className="bg-white rounded shadow border border-gray-200 mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration (hrs)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prerequisites</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {certifications.map(cert => (
              <tr key={cert.id}>
                <td className="px-4 py-2">{cert.name}</td>
                <td className="px-4 py-2">{cert.code}</td>
                <td className="px-4 py-2">{cert.type}</td>
                <td className="px-4 py-2">{cert.duration_hours}</td>
                <td className="px-4 py-2">{cert.prerequisites}</td>
                <td className="px-4 py-2">{cert.created_at ? new Date(cert.created_at).toLocaleDateString() : ''}</td>
              </tr>
            ))}
            {(!loading && certifications.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-2 text-center text-gray-500">
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
