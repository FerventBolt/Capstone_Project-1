'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Student {
  id: string
  name: string
  email: string
  student_id: string
  phone?: string
  address?: string
  enrolled_courses: string[]
  course_names: string[]
  overall_progress: number
  last_activity: string
  status: 'active' | 'at_risk' | 'excellent' | 'inactive'
  total_assignments: number
  completed_assignments: number
  average_score: number
  joined_date: string
}

interface CertificateSubmission {
  id: string
  student_id: string
  certificate_type: 'NC' | 'COC'
  certificate_name: string
  certificate_number: string
  course_name: string
  date_accredited: string
  expiration_date?: string
  file_url: string
  file_name: string
  status: 'pending' | 'approved' | 'rejected'
  remarks?: string
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
}

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [certificates, setCertificates] = useState<CertificateSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateSubmission | null>(null)
  const [reviewRemarks, setReviewRemarks] = useState('')

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Mock student data - replace with actual API call
        const mockStudent: Student = {
          id: params.id as string,
          name: 'Juan Dela Cruz',
          email: 'juan.delacruz@lpunetwork.edu.ph',
          student_id: 'LPU-2024-001',
          phone: '+639123456789',
          address: 'Manila, Philippines',
          enrolled_courses: ['1', '3'],
          course_names: ['Restaurant Service Operations', 'Front Desk Operations'],
          overall_progress: 85,
          last_activity: '2 hours ago',
          status: 'excellent',
          total_assignments: 12,
          completed_assignments: 10,
          average_score: 88,
          joined_date: '2024-01-15T00:00:00Z'
        }

        // Mock certificate submissions
        const mockCertificates: CertificateSubmission[] = [
          {
            id: '1',
            student_id: params.id as string,
            certificate_type: 'NC',
            certificate_name: 'Food & Beverages Services NC II',
            certificate_number: 'FBS-2024-001',
            course_name: 'Restaurant Service Operations',
            date_accredited: '2024-01-15',
            expiration_date: '2027-01-15',
            file_url: '/certificates/fbs-certificate.pdf',
            file_name: 'FBS_Certificate.pdf',
            status: 'pending',
            submitted_at: '2024-01-20'
          },
          {
            id: '2',
            student_id: params.id as string,
            certificate_type: 'COC',
            certificate_name: 'Front Office Operations COC',
            certificate_number: 'FOO-2024-002',
            course_name: 'Front Desk Operations',
            date_accredited: '2024-02-01',
            expiration_date: '2026-02-01',
            file_url: '/certificates/foo-certificate.pdf',
            file_name: 'FOO_Certificate.pdf',
            status: 'approved',
            remarks: 'Certificate verified and approved.',
            submitted_at: '2024-02-05',
            reviewed_at: '2024-02-07',
            reviewed_by: 'staff@lpu.edu.ph'
          },
          {
            id: '3',
            student_id: params.id as string,
            certificate_type: 'NC',
            certificate_name: 'Housekeeping Services NC II',
            certificate_number: 'HKS-2023-003',
            course_name: 'Hotel Housekeeping Operations',
            date_accredited: '2023-12-10',
            expiration_date: '2026-12-10',
            file_url: '/certificates/hks-certificate.pdf',
            file_name: 'HKS_Certificate.pdf',
            status: 'rejected',
            remarks: 'Certificate number could not be verified. Please resubmit with correct certificate number.',
            submitted_at: '2024-01-10',
            reviewed_at: '2024-01-12',
            reviewed_by: 'staff@lpu.edu.ph'
          }
        ]

        setStudent(mockStudent)
        setCertificates(mockCertificates)
      } catch (error) {
        console.error('Error fetching student data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchStudentData()
    }
  }, [params.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const handleReviewCertificate = (certificate: CertificateSubmission) => {
    setSelectedCertificate(certificate)
    setReviewRemarks(certificate.remarks || '')
    setShowReviewModal(true)
  }

  const handleSubmitReview = async (action: 'approve' | 'reject') => {
    if (!selectedCertificate) return

    try {
      // TODO: Implement API call to update certificate status
      console.log('Updating certificate:', selectedCertificate.id, action, reviewRemarks)
      
      // Mock update
      const updatedCertificates = certificates.map(cert =>
        cert.id === selectedCertificate.id
          ? {
              ...cert,
              status: action === 'approve' ? 'approved' as const : 'rejected' as const,
              remarks: reviewRemarks,
              reviewed_at: new Date().toISOString().split('T')[0],
              reviewed_by: 'staff@lpu.edu.ph'
            }
          : cert
      )
      
      setCertificates(updatedCertificates)
      setShowReviewModal(false)
      setSelectedCertificate(null)
      setReviewRemarks('')
      
      alert(`Certificate ${action}d successfully!`)
    } catch (error) {
      console.error('Error updating certificate:', error)
      alert('Error updating certificate. Please try again.')
    }
  }

  const handleRemoveCertificate = async (certificateId: string) => {
    if (!confirm('Are you sure you want to remove this certificate submission?')) {
      return
    }

    try {
      // TODO: Implement API call to remove certificate
      console.log('Removing certificate:', certificateId)
      
      // Mock removal
      const updatedCertificates = certificates.filter(cert => cert.id !== certificateId)
      setCertificates(updatedCertificates)
      
      alert('Certificate removed successfully!')
    } catch (error) {
      console.error('Error removing certificate:', error)
      alert('Error removing certificate. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Student Not Found</h1>
          <p className="text-gray-600 mb-6">The student you're looking for doesn't exist.</p>
          {/* @ts-expect-error - Next.js Link component type issue with strict TypeScript */}
          <Link href="/staff/students" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            Back to Students
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
            <p className="text-gray-600 mt-2">View and manage student information and certificates</p>
          </div>
          {/* @ts-expect-error - Next.js Link component type issue with strict TypeScript */}
          <Link href="/staff/students" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium">
            Back to Students
          </Link>
        </div>
      </div>

      {/* Student Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-medium text-blue-600">
              {student.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {student.student_id}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-900">{student.email}</p>
                  {student.phone && <p className="text-sm text-gray-900">{student.phone}</p>}
                  {student.address && <p className="text-sm text-gray-900">{student.address}</p>}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Academic Progress</h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Progress</span>
                      <span className="font-medium">{student.overall_progress}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${student.overall_progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-900">
                    Assignments: {student.completed_assignments}/{student.total_assignments}
                  </p>
                  <p className="text-sm text-gray-900">
                    Average Score: {student.average_score}%
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Enrolled Courses</h3>
                <div className="space-y-1">
                  {student.course_names.map((course, index) => (
                    <span key={index} className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1 mb-1">
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Submissions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Certificate Submissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {certificates.map((certificate) => (
                <tr key={certificate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{certificate.certificate_name}</div>
                      <div className="text-sm text-gray-500">{certificate.certificate_number}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                      {certificate.certificate_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {certificate.submitted_at}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(certificate.status)}`}>
                      {certificate.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReviewCertificate(certificate)}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        Review
                      </button>
                      <a
                        href={certificate.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-500"
                      >
                        View File
                      </a>
                      <button
                        onClick={() => handleRemoveCertificate(certificate.id)}
                        className="text-red-600 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Review Certificate Submission
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Student:</label>
                  <p className="text-sm text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Certificate Type:</label>
                  <p className="text-sm text-gray-900">{selectedCertificate.certificate_type}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Certificate Name:</label>
                <p className="text-sm text-gray-900">{selectedCertificate.certificate_name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Certificate Number:</label>
                  <p className="text-sm text-gray-900">{selectedCertificate.certificate_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Course Name:</label>
                  <p className="text-sm text-gray-900">{selectedCertificate.course_name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Date Accredited:</label>
                  <p className="text-sm text-gray-900">{selectedCertificate.date_accredited}</p>
                </div>
                {selectedCertificate.expiration_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Expiration Date:</label>
                    <p className="text-sm text-gray-900">{selectedCertificate.expiration_date}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Certificate File:</label>
                <div className="mt-1">
                  <a
                    href={selectedCertificate.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    📄 View {selectedCertificate.file_name}
                  </a>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks:
                </label>
                <textarea
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Add remarks for approval or rejection..."
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleSubmitReview('approve')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleSubmitReview('reject')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setShowReviewModal(false)
                  setSelectedCertificate(null)
                  setReviewRemarks('')
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}