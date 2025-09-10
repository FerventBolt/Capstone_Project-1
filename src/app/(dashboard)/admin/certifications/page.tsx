'use client'

import { useState, useEffect } from 'react'

interface CertificateSubmission {
  id: string
  student_id: string
  student_name: string
  student_email: string
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

interface TESDACertification {
  id: string
  name: string
  code: string
  description: string
  type: 'food_beverages' | 'front_office' | 'housekeeping' | 'tourism' | 'cookery'
  duration_hours: number
  prerequisites: string[]
  is_active: boolean
  created_at: string
  applications_count: number
  completions_count: number
}

export default function AdminCertifications() {
  const [submissions, setSubmissions] = useState<CertificateSubmission[]>([])
  const [certifications, setCertifications] = useState<TESDACertification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'submissions' | 'tesda'>('submissions')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<CertificateSubmission | null>(null)
  const [reviewRemarks, setReviewRemarks] = useState('')
  const [newCertification, setNewCertification] = useState({
    name: '',
    code: '',
    description: '',
    type: 'food_beverages' as 'food_beverages' | 'front_office' | 'housekeeping' | 'tourism' | 'cookery',
    duration_hours: 0,
    prerequisites: [] as string[],
    is_active: true
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data for student certificate submissions
        setSubmissions([
          {
            id: '1',
            student_id: 'student-1',
            student_name: 'Juan Dela Cruz',
            student_email: 'juan.student@lpunetwork.edu.ph',
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
            student_id: 'student-2',
            student_name: 'Maria Santos',
            student_email: 'maria.student@lpunetwork.edu.ph',
            certificate_type: 'COC',
            certificate_name: 'Commercial Cooking COC',
            certificate_number: 'CC-2024-002',
            course_name: 'Basic Culinary Arts',
            date_accredited: '2024-02-01',
            expiration_date: '2026-02-01',
            file_url: '/certificates/cc-certificate.pdf',
            file_name: 'CC_Certificate.pdf',
            status: 'approved',
            remarks: 'Certificate verified and approved.',
            submitted_at: '2024-02-05',
            reviewed_at: '2024-02-07',
            reviewed_by: 'admin@lpu.edu.ph'
          },
          {
            id: '3',
            student_id: 'student-3',
            student_name: 'Ana Rodriguez',
            student_email: 'ana.student@lpunetwork.edu.ph',
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
            reviewed_by: 'admin@lpu.edu.ph'
          }
        ])

        // Get TESDA certifications from API and localStorage
        const response = await fetch('/api/admin/certifications', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        let defaultCertifications = []
        if (response.ok) {
          const result = await response.json()
          defaultCertifications = result.certifications || []
        }
        
        // Get user-created certifications from localStorage
        let userCreatedCertifications = []
        try {
          const storedCertifications = localStorage.getItem('demo-certifications')
          if (storedCertifications) {
            userCreatedCertifications = JSON.parse(storedCertifications)
          }
        } catch (storageError) {
          console.error('Error reading certifications from localStorage:', storageError)
        }
        
        const allCertifications = [...defaultCertifications, ...userCreatedCertifications]
        setCertifications(allCertifications)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'food_beverages':
        return '🍽️'
      case 'front_office':
        return '🏨'
      case 'housekeeping':
        return '🧹'
      case 'tourism':
        return '🗺️'
      case 'cookery':
        return '👨‍🍳'
      default:
        return '📜'
    }
  }

  const handleReviewSubmission = (submission: CertificateSubmission) => {
    setSelectedSubmission(submission)
    setReviewRemarks(submission.remarks || '')
    setShowReviewModal(true)
  }

  const handleSubmitReview = async (action: 'approve' | 'reject') => {
    if (!selectedSubmission) return

    try {
      // TODO: Implement API call to update submission status
      console.log('Updating submission:', selectedSubmission.id, action, reviewRemarks)
      
      // Mock update
      const updatedSubmissions = submissions.map(sub =>
        sub.id === selectedSubmission.id
          ? {
              ...sub,
              status: action === 'approve' ? 'approved' as const : 'rejected' as const,
              remarks: reviewRemarks,
              reviewed_at: new Date().toISOString().split('T')[0],
              reviewed_by: 'admin@lpu.edu.ph'
            }
          : sub
      )
      
      setSubmissions(updatedSubmissions)
      setShowReviewModal(false)
      setSelectedSubmission(null)
      setReviewRemarks('')
      
      alert(`Certificate submission ${action}d successfully!`)
    } catch (error) {
      console.error('Error updating submission:', error)
      alert('Error updating submission. Please try again.')
    }
  }

  const handleCreateCertification = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Call API to create certification
      const response = await fetch('/api/admin/certifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCertification),
      })

      if (response.ok) {
        const result = await response.json()
        const newCert = result.certification
        const updatedCertifications = [...certifications, newCert]
        setCertifications(updatedCertifications)
        
        // Save to localStorage (only user-created certifications)
        const userCreatedCertifications = updatedCertifications.filter(cert =>
          !cert.id.startsWith('default-')
        )
        localStorage.setItem('demo-certifications', JSON.stringify(userCreatedCertifications))
        
        // Reset form and close modal
        setNewCertification({
          name: '',
          code: '',
          description: '',
          type: 'food_beverages',
          duration_hours: 0,
          prerequisites: [],
          is_active: true
        })
        setShowCreateForm(false)
        alert('TESDA certification created successfully!')
      } else {
        alert('Failed to create certification. Please try again.')
      }
    } catch (error) {
      console.error('Error creating certification:', error)
      alert('Error creating certification. Please try again.')
    }
  }

  const handleDeleteCertification = async (certificationId: string) => {
    if (!confirm('Are you sure you want to delete this TESDA certification?')) {
      return
    }

    try {
      const response = await fetch('/api/admin/certifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: certificationId }),
      })

      if (response.ok) {
        const updatedCertifications = certifications.filter(cert => cert.id !== certificationId)
        setCertifications(updatedCertifications)
        
        // Update localStorage (only user-created certifications)
        const userCreatedCertifications = updatedCertifications.filter(cert =>
          !cert.id.startsWith('default-')
        )
        localStorage.setItem('demo-certifications', JSON.stringify(userCreatedCertifications))
        
        alert('TESDA certification deleted successfully!')
      } else {
        alert('Failed to delete certification. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting certification:', error)
      alert('Error deleting certification. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Certification Management</h1>
            <p className="text-gray-600 mt-2">Review student certificate submissions and manage TESDA exam certifications.</p>
          </div>
          {activeTab === 'tesda' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              + Add TESDA Exam
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'submissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Student Submissions ({submissions.length})
            </button>
            <button
              onClick={() => setActiveTab('tesda')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tesda'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              TESDA Exams ({certifications.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Student Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
              <div className="text-sm text-gray-600">Total Submissions</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {submissions.filter(s => s.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-green-600">
                {submissions.filter(s => s.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-red-600">
                {submissions.filter(s => s.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Certificate Submissions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
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
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{submission.student_name}</div>
                          <div className="text-sm text-gray-500">{submission.student_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{submission.certificate_name}</div>
                          <div className="text-sm text-gray-500">{submission.certificate_number}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          {submission.certificate_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {submission.submitted_at}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                          {submission.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleReviewSubmission(submission)}
                            className="text-blue-600 hover:text-blue-500"
                          >
                            Review
                          </button>
                          <a
                            href={submission.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-500"
                          >
                            View File
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TESDA Certifications Tab */}
      {activeTab === 'tesda' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-blue-600">{certifications.length}</div>
              <div className="text-sm text-gray-600">Total TESDA Exams</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-green-600">
                {certifications.reduce((sum, cert) => sum + cert.applications_count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-purple-600">
                {certifications.reduce((sum, cert) => sum + cert.completions_count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Completions</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-600">
                {certifications.filter(cert => cert.is_active).length}
              </div>
              <div className="text-sm text-gray-600">Active Exams</div>
            </div>
          </div>

          {/* TESDA Certifications List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">TESDA Exam Certifications</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completions
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
                  {certifications.map((cert) => (
                    <tr key={cert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">{getTypeIcon(cert.type)}</div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{cert.name}</div>
                            <div className="text-sm text-gray-500">{cert.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cert.duration_hours} hours
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cert.applications_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cert.completions_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          cert.is_active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                        }`}>
                          {cert.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              window.location.href = `/admin/certifications/${cert.id}`
                            }}
                            className="text-blue-600 hover:text-blue-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCertification(cert.id)}
                            className="text-red-600 hover:text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Review Certificate Submission
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Student:</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.student_name}</p>
                  <p className="text-xs text-gray-500">{selectedSubmission.student_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Certificate Type:</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.certificate_type}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Certificate Name:</label>
                <p className="text-sm text-gray-900">{selectedSubmission.certificate_name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Certificate Number:</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.certificate_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Course Name:</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.course_name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Date Accredited:</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.date_accredited}</p>
                </div>
                {selectedSubmission.expiration_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Expiration Date:</label>
                    <p className="text-sm text-gray-900">{selectedSubmission.expiration_date}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Certificate File:</label>
                <div className="mt-1">
                  <a
                    href={selectedSubmission.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    📄 View {selectedSubmission.file_name}
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
                  setSelectedSubmission(null)
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

      {/* Create TESDA Certification Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add TESDA Exam Certification</h2>
            <form onSubmit={handleCreateCertification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certification Name
                </label>
                <input
                  type="text"
                  value={newCertification.name}
                  onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certification Code
                </label>
                <input
                  type="text"
                  value={newCertification.code}
                  onChange={(e) => setNewCertification({ ...newCertification, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCertification.description}
                  onChange={(e) => setNewCertification({ ...newCertification, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newCertification.type}
                  onChange={(e) => setNewCertification({ ...newCertification, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="food_beverages">Food & Beverages</option>
                  <option value="front_office">Front Office</option>
                  <option value="housekeeping">Housekeeping</option>
                  <option value="tourism">Tourism</option>
                  <option value="cookery">Cookery</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (Hours)
                </label>
                <input
                  type="number"
                  value={newCertification.duration_hours}
                  onChange={(e) => setNewCertification({ ...newCertification, duration_hours: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={newCertification.is_active}
                  onChange={(e) => setNewCertification({ ...newCertification, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Create TESDA Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
                