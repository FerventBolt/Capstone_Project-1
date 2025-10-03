'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

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

export default function ApplicationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<CertificationApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newNotes, setNewNotes] = useState('')

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        console.log('DEBUG: Fetching application with ID:', params.id)
        
        // Mock data for now - replace with actual Supabase call
        const mockApplication: CertificationApplication = {
          id: params.id as string,
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
        }
        
        setApplication(mockApplication)
        setNewNotes(mockApplication.notes)
      } catch (error) {
        console.error('Error fetching application:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchApplication()
    }
  }, [params.id])

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected' | 'under_review') => {
    if (!application) return

    setUpdating(true)
    try {
      console.log('DEBUG: Updating application status:', { id: application.id, status: newStatus, notes: newNotes })
      
      // TODO: Implement Supabase update
      setApplication({
        ...application,
        status: newStatus,
        notes: newNotes,
        reviewedBy: 'admin@lpu.edu.ph',
        reviewedAt: new Date().toISOString()
      })
      
      alert(`Application ${newStatus} successfully!`)
    } catch (error) {
      console.error('Error updating application:', error)
      alert('Failed to update application')
    } finally {
      setUpdating(false)
    }
  }

  const handleDocumentVerification = async (docId: string, verified: boolean) => {
    if (!application) return

    try {
      console.log('DEBUG: Updating document verification:', { docId, verified })
      
      // TODO: Implement Supabase update
      setApplication({
        ...application,
        documents: application.documents.map(doc =>
          doc.id === docId ? { ...doc, verified } : doc
        )
      })
      
      alert(`Document ${verified ? 'verified' : 'unverified'} successfully!`)
    } catch (error) {
      console.error('Error updating document:', error)
      alert('Failed to update document')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h1>
          <p className="text-gray-600 mb-6">The application you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin/certifications/applications')}
            className="btn-primary"
          >
            Back to Applications
          </button>
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
            <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
            <p className="text-gray-600 mt-2">Review and manage certification application</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(application.status)}`}>
              {application.status.replace('_', ' ').toUpperCase()}
            </span>
            <button
              onClick={() => router.push('/admin/certifications/applications')}
              className="btn-secondary"
            >
              Back to Applications
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Name</label>
                <p className="text-sm text-gray-900">{application.studentName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">{application.studentEmail}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Certification Type</label>
                <p className="text-sm text-gray-900">{application.certificationType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Course</label>
                <p className="text-sm text-gray-900">{application.courseTitle}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Application Date</label>
                <p className="text-sm text-gray-900">{new Date(application.applicationDate).toLocaleDateString()}</p>
              </div>
              {application.reviewedBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Reviewed By</label>
                  <p className="text-sm text-gray-900">{application.reviewedBy}</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
            <div className="space-y-3">
              {application.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📄</div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                      <div className="text-xs text-gray-500">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      doc.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.verified ? 'Verified' : 'Pending'}
                    </span>
                    <button
                      onClick={() => handleDocumentVerification(doc.id, !doc.verified)}
                      className={`text-sm font-medium ${
                        doc.verified ? 'text-red-600 hover:text-red-500' : 'text-green-600 hover:text-green-500'
                      }`}
                    >
                      {doc.verified ? 'Unverify' : 'Verify'}
                    </button>
                    <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {application.status === 'pending' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={updating}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Approve Application'}
                </button>
                <button
                  onClick={() => handleStatusUpdate('under_review')}
                  disabled={updating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Mark Under Review'}
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={updating}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Reject Application'}
                </button>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={4}
              className="input-field mb-3"
              placeholder="Add notes about this application..."
            />
            <button
              onClick={() => {
                if (application) {
                  setApplication({ ...application, notes: newNotes })
                  alert('Notes updated successfully!')
                }
              }}
              className="w-full btn-secondary"
            >
              Update Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}