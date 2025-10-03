'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'staff' | 'student'
  status: 'active' | 'inactive' | 'pending'
  lastLogin: string
  createdAt: string
  phone?: string
  address?: string
  dateOfBirth?: string
  emergencyContact?: string
  courses?: Course[]
  certifications?: Certification[]
}

interface Course {
  id: string
  title: string
  status: 'enrolled' | 'completed' | 'in_progress'
  enrolledAt: string
  completedAt?: string
  progress: number
}

interface Certification {
  id: string
  name: string
  status: 'pending' | 'approved' | 'completed'
  appliedAt: string
  completedAt?: string
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

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [certificateSubmissions, setCertificateSubmissions] = useState<CertificateSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'certifications' | 'submissions'>('profile')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateSubmission | null>(null)
  const [reviewRemarks, setReviewRemarks] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('DEBUG: Fetching user with ID:', params.id)
        
        // Mock data for now - replace with actual Supabase call
        const mockUser: User = {
          id: params.id as string,
          email: 'juan.delacruz@lpunetwork.edu.ph',
          firstName: 'Juan',
          lastName: 'Dela Cruz',
          role: 'student',
          status: 'active',
          lastLogin: '2024-01-15 08:45:00',
          createdAt: '2024-01-02 14:20:00',
          phone: '+63 912 345 6789',
          address: '123 Main St, Manila, Philippines',
          dateOfBirth: '1995-06-15',
          emergencyContact: 'Maria Dela Cruz - +63 912 345 6788',
          courses: [
            {
              id: '1',
              title: 'Restaurant Service Operations NC II',
              status: 'in_progress',
              enrolledAt: '2024-01-01',
              progress: 85
            },
            {
              id: '2',
              title: 'Front Desk Operations NC II',
              status: 'completed',
              enrolledAt: '2023-10-01',
              completedAt: '2023-12-15',
              progress: 100
            }
          ],
          certifications: [
            {
              id: '1',
              name: 'Food & Beverages Services NC II',
              status: 'completed',
              appliedAt: '2023-11-01',
              completedAt: '2023-12-20'
            },
            {
              id: '2',
              name: 'Front Office Services NC II',
              status: 'pending',
              appliedAt: '2024-01-10'
            }
          ]
        }

        // Mock certificate submissions for students
        const mockCertificateSubmissions: CertificateSubmission[] = [
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
            reviewed_by: 'admin@lpu.edu.ph'
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
            reviewed_by: 'admin@lpu.edu.ph'
          }
        ]
        
        setUser(mockUser)
        setCertificateSubmissions(mockCertificateSubmissions)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchUser()
    }
  }, [params.id])

  const handleStatusChange = async (newStatus: 'active' | 'inactive' | 'pending') => {
    if (!user) return

    try {
      console.log('DEBUG: Updating user status:', { id: user.id, status: newStatus })
      // TODO: Implement Supabase update
      setUser({ ...user, status: newStatus })
      alert(`User status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Failed to update user status')
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
      const updatedCertificates = certificateSubmissions.map(cert =>
        cert.id === selectedCertificate.id
          ? {
              ...cert,
              status: action === 'approve' ? 'approved' as const : 'rejected' as const,
              remarks: reviewRemarks,
              reviewed_at: new Date().toISOString().split('T')[0],
              reviewed_by: 'admin@lpu.edu.ph'
            }
          : cert
      )
      
      setCertificateSubmissions(updatedCertificates)
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
      const updatedCertificates = certificateSubmissions.filter(cert => cert.id !== certificateId)
      setCertificateSubmissions(updatedCertificates)
      
      alert('Certificate removed successfully!')
    } catch (error) {
      console.error('Error removing certificate:', error)
      alert('Error removing certificate. Please try again.')
    }
  }

  const getCertificateStatusColor = (status: string) => {
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'staff': return 'bg-blue-100 text-blue-800'
      case 'student': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
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

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <p className="text-gray-600 mb-6">The user you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="btn-primary"
          >
            Back to Users
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
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-medium text-blue-600">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/admin/users')}
              className="btn-secondary"
            >
              Back to Users
            </button>
            <button
              onClick={() => router.push(`/admin/users/${user.id}/edit`)}
              className="btn-primary"
            >
              Edit User
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile
            </button>
            {user.role === 'student' && (
              <>
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'courses'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Courses ({user.courses?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('certifications')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'certifications'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Certifications ({user.certifications?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'submissions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Certificate Submissions ({certificateSubmissions.length})
                </button>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone</label>
                <p className="text-sm text-gray-900">{user.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-sm text-gray-900">
                  {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Address</label>
                <p className="text-sm text-gray-900">{user.address || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Emergency Contact</label>
                <p className="text-sm text-gray-900">{user.emergencyContact || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Account Created</label>
                <p className="text-sm text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Login</label>
                <p className="text-sm text-gray-900">
                  {user.lastLogin === 'Never' ? 'Never' : new Date(user.lastLogin).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Status</label>
                <select
                  value={user.status}
                  onChange={(e) => handleStatusChange(e.target.value as any)}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && user.courses && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Enrolled Courses</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrolled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {user.courses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        course.status === 'completed' ? 'bg-green-100 text-green-800' :
                        course.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{course.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(course.enrolledAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.completedAt ? new Date(course.completedAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'certifications' && user.certifications && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {user.certifications.map((cert) => (
                  <tr key={cert.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cert.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        cert.status === 'completed' ? 'bg-green-100 text-green-800' :
                        cert.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cert.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cert.completedAt ? new Date(cert.completedAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'submissions' && user.role === 'student' && (
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
                {certificateSubmissions.map((certificate) => (
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
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCertificateStatusColor(certificate.status)}`}>
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
      )}

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
                  <p className="text-sm text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
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