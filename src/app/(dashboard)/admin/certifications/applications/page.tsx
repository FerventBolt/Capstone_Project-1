'use client'

import { useState, useEffect } from 'react'

interface CertificationApplication {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  certificationType: 'Food & Beverages Services NC II' | 'Front Office Services NC II' | 'Housekeeping Services NC II' | 'Tourism Promotion Services NC III' | 'Commercial Cooking NC II'
  courseId: string
  courseTitle: string
  applicationDate: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  reviewedBy?: string
  reviewedAt?: string
  documents: Document[]
  notes: string
}

interface Document {
  id: string
  name: string
  type: string
  uploadedAt: string
  verified: boolean
}

export default function CertificationApplicationsPage() {
  const [applications, setApplications] = useState<CertificationApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedApplication, setSelectedApplication] = useState<CertificationApplication | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    // TODO: Fetch real data from Supabase
    const fetchApplications = async () => {
      try {
        // Mock data for now
        setApplications([
          {
            id: '1',
            studentId: '1',
            studentName: 'Juan Dela Cruz',
            studentEmail: 'juan.student@lpunetwork.edu.ph',
            certificationType: 'Food & Beverages Services NC II',
            courseId: '1',
            courseTitle: 'Restaurant Service Operations NC II',
            applicationDate: '2024-01-15 10:00:00',
            status: 'pending',
            documents: [
              { id: '1', name: 'Certificate of Completion.pdf', type: 'completion', uploadedAt: '2024-01-15 10:00:00', verified: true },
              { id: '2', name: 'Training Record.pdf', type: 'training_record', uploadedAt: '2024-01-15 10:01:00', verified: true },
              { id: '3', name: 'ID Copy.pdf', type: 'identification', uploadedAt: '2024-01-15 10:02:00', verified: false }
            ],
            notes: 'Student has completed all required training hours and assessments.'
          },
          {
            id: '2',
            studentId: '2',
            studentName: 'Maria Santos',
            studentEmail: 'maria.student@lpunetwork.edu.ph',
            certificationType: 'Front Office Services NC II',
            courseId: '2',
            courseTitle: 'Front Desk Operations NC II',
            applicationDate: '2024-01-14 14:30:00',
            status: 'under_review',
            reviewedBy: 'admin@lpu.edu.ph',
            reviewedAt: '2024-01-15 09:00:00',
            documents: [
              { id: '4', name: 'Certificate of Completion.pdf', type: 'completion', uploadedAt: '2024-01-14 14:30:00', verified: true },
              { id: '5', name: 'Training Record.pdf', type: 'training_record', uploadedAt: '2024-01-14 14:31:00', verified: true }
            ],
            notes: 'All documents verified. Ready for TESDA submission.'
          },
          {
            id: '3',
            studentId: '3',
            studentName: 'Ana Rodriguez',
            studentEmail: 'ana.student@lpunetwork.edu.ph',
            certificationType: 'Housekeeping Services NC II',
            courseId: '3',
            courseTitle: 'Housekeeping Services NC II',
            applicationDate: '2024-01-13 16:45:00',
            status: 'approved',
            reviewedBy: 'admin@lpu.edu.ph',
            reviewedAt: '2024-01-14 10:30:00',
            documents: [
              { id: '6', name: 'Certificate of Completion.pdf', type: 'completion', uploadedAt: '2024-01-13 16:45:00', verified: true },
              { id: '7', name: 'Training Record.pdf', type: 'training_record', uploadedAt: '2024-01-13 16:46:00', verified: true },
              { id: '8', name: 'Assessment Results.pdf', type: 'assessment', uploadedAt: '2024-01-13 16:47:00', verified: true }
            ],
            notes: 'Application approved. TESDA certification issued.'
          },
          {
            id: '4',
            studentId: '4',
            studentName: 'Carlos Mendoza',
            studentEmail: 'carlos.student@lpunetwork.edu.ph',
            certificationType: 'Commercial Cooking NC II',
            courseId: '4',
            courseTitle: 'Commercial Cooking NC II',
            applicationDate: '2024-01-12 11:15:00',
            status: 'rejected',
            reviewedBy: 'admin@lpu.edu.ph',
            reviewedAt: '2024-01-13 14:20:00',
            documents: [
              { id: '9', name: 'Certificate of Completion.pdf', type: 'completion', uploadedAt: '2024-01-12 11:15:00', verified: false }
            ],
            notes: 'Incomplete training hours. Student needs to complete additional 40 hours of practical training.'
          }
        ])
      } catch (error) {
        console.error('Error fetching applications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    const matchesType = filterType === 'all' || app.certificationType === filterType
    return matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleReviewApplication = (application: CertificationApplication) => {
    setSelectedApplication(application)
    setShowReviewModal(true)
  }

  const handleUpdateStatus = async (status: 'approved' | 'rejected', notes: string) => {
    if (!selectedApplication) return

    try {
      // TODO: Implement Supabase status update
      console.log('Updating application status:', { id: selectedApplication.id, status, notes })
      
      // Mock update
      setApplications(prev => prev.map(app => 
        app.id === selectedApplication.id 
          ? { 
              ...app, 
              status, 
              notes,
              reviewedBy: 'admin@lpu.edu.ph',
              reviewedAt: new Date().toISOString()
            }
          : app
      ))
      
      setShowReviewModal(false)
      setSelectedApplication(null)
      alert(`Application ${status} successfully!`)
    } catch (error) {
      console.error('Error updating application:', error)
      alert('Failed to update application')
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
        <h1 className="text-3xl font-bold text-gray-900">Certification Applications</h1>
        <p className="text-gray-600 mt-2">Review and manage TESDA certification applications</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Certification Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field"
            >
              <option value="all">All Types</option>
              <option value="Food & Beverages Services NC II">Food & Beverages Services NC II</option>
              <option value="Front Office Services NC II">Front Office Services NC II</option>
              <option value="Housekeeping Services NC II">Housekeeping Services NC II</option>
              <option value="Tourism Promotion Services NC III">Tourism Promotion Services NC III</option>
              <option value="Commercial Cooking NC II">Commercial Cooking NC II</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Applications ({filteredApplications.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certification Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{application.studentName}</div>
                    <div className="text-sm text-gray-500">{application.studentEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{application.certificationType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{application.courseTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {application.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.applicationDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {application.documents.length} files
                    </div>
                    <div className="text-xs text-gray-500">
                      {application.documents.filter(d => d.verified).length} verified
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleReviewApplication(application)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => {
                        console.log('DEBUG: View details button clicked for application:', application.id)
                        window.location.href = `/admin/certifications/applications/${application.id}`
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Review Application - {selectedApplication.studentName}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Application Details</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Certification Type:</span>
                    <span className="text-sm font-medium">{selectedApplication.certificationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Course:</span>
                    <span className="text-sm font-medium">{selectedApplication.courseTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Applied:</span>
                    <span className="text-sm font-medium">{new Date(selectedApplication.applicationDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Documents</h4>
                <div className="space-y-2">
                  {selectedApplication.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        <div className="text-xs text-gray-500">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          doc.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.verified ? 'Verified' : 'Pending'}
                        </span>
                        <button className="text-blue-600 hover:text-blue-900 text-xs">View</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedApplication.notes}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleUpdateStatus('approved', selectedApplication.notes)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleUpdateStatus('rejected', selectedApplication.notes)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setShowReviewModal(false)
                  setSelectedApplication(null)
                }}
                className="flex-1 btn-secondary"
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