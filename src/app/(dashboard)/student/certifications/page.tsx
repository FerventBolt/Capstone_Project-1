'use client'

import { useState, useEffect } from 'react'

interface CertificateSubmission {
  id: string
  certificate_type: 'NC' | 'COC'
  certificate_name: string
  certificate_number: string
  course_name?: string
  training_course_name?: string
  training_hours?: number
  conducted_from?: string
  conducted_to?: string
  given_date?: string
  date_accredited?: string
  expiration_date?: string
  file_url: string
  file_name: string
  status: 'pending' | 'approved' | 'rejected' | 'in_progress'
  remarks?: string
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
}

interface Certification {
  id: string
  name: string
  code: string
  description: string
  type: 'food_beverages' | 'front_office' | 'housekeeping' | 'tourism' | 'cookery'
  duration_hours: number
  prerequisites: string[]
  status: 'not_applied' | 'pending' | 'approved' | 'in_progress' | 'completed'
  progress: number
  applicationDate?: string
  examDate?: string
  certificateUrl?: string
  requiredCourses: string[]
  completedCourses: string[]
}

export default function StudentCertifications() {
  const [submissions, setSubmissions] = useState<CertificateSubmission[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'submissions' | 'tesda'>('submissions')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingSubmission, setEditingSubmission] = useState<CertificateSubmission | null>(null)
  const [newSubmission, setNewSubmission] = useState({
    certificate_type: 'NC' as 'NC' | 'COC',
    certificate_name: '',
    certificate_number: '',
    course_name: '',
    training_course_name: '',
    training_hours: 0,
    conducted_from: '',
    conducted_to: '',
    given_date: '',
    date_accredited: '',
    expiration_date: '',
    file: null as File | null
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 DEBUG: Fetching student certificate submissions from localStorage...')
        
        // Get certificate submissions from localStorage
        let storedSubmissions = []
        try {
          const submissionsData = localStorage.getItem('student-certificate-submissions')
          if (submissionsData) {
            storedSubmissions = JSON.parse(submissionsData)
            console.log('🔍 DEBUG: Found certificate submissions in localStorage:', storedSubmissions.length)
          }
        } catch (storageError) {
          console.error('🔍 DEBUG: Error reading certificate submissions from localStorage:', storageError)
        }
        
        // Add default submissions if none exist
        if (storedSubmissions.length === 0) {
          storedSubmissions = [
            {
              id: '1',
              certificate_type: 'NC',
              certificate_name: 'Food & Beverages Services NC II',
              certificate_number: 'FBS-2024-001',
              course_name: 'Restaurant Service Operations',
              date_accredited: '2024-01-15',
              expiration_date: '2027-01-15',
              file_url: '/certificates/fbs-certificate.pdf',
              file_name: 'FBS_Certificate.pdf',
              status: 'approved',
              remarks: 'Certificate verified and approved.',
              submitted_at: '2024-01-20',
              reviewed_at: '2024-01-22',
              reviewed_by: 'admin@lpu.edu.ph'
            },
            {
              id: '2',
              certificate_type: 'COC',
              certificate_name: 'Commercial Cooking COC',
              certificate_number: 'CC-2024-002',
              training_course_name: 'Basic Culinary Arts Training',
              training_hours: 40,
              conducted_from: '2024-01-15',
              conducted_to: '2024-01-25',
              given_date: '2024-02-01',
              file_url: '/certificates/cc-certificate.pdf',
              file_name: 'CC_Certificate.pdf',
              status: 'pending',
              submitted_at: '2024-02-05'
            },
            {
              id: '3',
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
          console.log('🔍 DEBUG: Added default certificate submissions')
          
          // Save default submissions to localStorage
          localStorage.setItem('student-certificate-submissions', JSON.stringify(storedSubmissions))
        }
        
        setSubmissions(storedSubmissions)

        // Mock data for TESDA certifications
        setCertifications([
          {
            id: '1',
            name: 'Food & Beverages Services NC II',
            code: 'FBS-NCII',
            description: 'National Certificate II in Food & Beverages Services covering restaurant service, bar operations, and customer service skills.',
            type: 'food_beverages',
            duration_hours: 320,
            prerequisites: ['Basic Food Safety', 'Customer Service Fundamentals'],
            status: 'in_progress',
            progress: 65,
            applicationDate: '2024-01-15',
            examDate: '2024-06-15',
            requiredCourses: ['Restaurant Service Operations', 'Bar Operations and Beverage Service'],
            completedCourses: ['Restaurant Service Operations']
          },
          {
            id: '2',
            name: 'Front Office Services NC II',
            code: 'FOS-NCII',
            description: 'National Certificate II in Front Office Services covering reception, reservations, and guest relations.',
            type: 'front_office',
            duration_hours: 280,
            prerequisites: ['Basic Computer Skills', 'Communication Skills'],
            status: 'not_applied',
            progress: 0,
            requiredCourses: ['Front Desk Operations', 'Guest Relations Management'],
            completedCourses: []
          }
        ])
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
      case 'in_progress':
        return 'text-blue-600 bg-blue-100'
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'not_applied':
        return 'text-gray-600 bg-gray-100'
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewSubmission({ ...newSubmission, file })
    }
  }

  const handleEditSubmission = (submission: CertificateSubmission) => {
    setEditingSubmission(submission)
    setNewSubmission({
      certificate_type: submission.certificate_type,
      certificate_name: submission.certificate_name,
      certificate_number: submission.certificate_number,
      course_name: submission.course_name || '',
      training_course_name: submission.training_course_name || '',
      training_hours: submission.training_hours || 0,
      conducted_from: submission.conducted_from || '',
      conducted_to: submission.conducted_to || '',
      given_date: submission.given_date || '',
      date_accredited: submission.date_accredited || '',
      expiration_date: submission.expiration_date || '',
      file: null
    })
    setShowEditForm(true)
  }

  const handleSubmitCertificate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newSubmission.file && !editingSubmission) {
      alert('Please select a file to upload.')
      return
    }

    try {
      console.log('🔍 DEBUG: Submitting certificate:', newSubmission)
      
      let updatedSubmissions: CertificateSubmission[]
      
      if (editingSubmission) {
        // Update existing submission
        updatedSubmissions = submissions.map(sub =>
          sub.id === editingSubmission.id
            ? {
                ...sub,
                certificate_type: newSubmission.certificate_type,
                certificate_name: newSubmission.certificate_name,
                certificate_number: newSubmission.certificate_number,
                course_name: newSubmission.course_name || undefined,
                training_course_name: newSubmission.training_course_name || undefined,
                training_hours: newSubmission.training_hours || undefined,
                conducted_from: newSubmission.conducted_from || undefined,
                conducted_to: newSubmission.conducted_to || undefined,
                given_date: newSubmission.given_date || undefined,
                date_accredited: newSubmission.date_accredited || undefined,
                expiration_date: newSubmission.expiration_date || undefined,
                file_name: newSubmission.file ? newSubmission.file.name : sub.file_name,
                status: 'pending' as const,
                remarks: undefined,
                reviewed_at: undefined,
                reviewed_by: undefined
              }
            : sub
        )
        console.log('🔍 DEBUG: Updated existing certificate submission')
        setShowEditForm(false)
        setEditingSubmission(null)
        alert('Certificate updated successfully!')
      } else {
        // Create new submission
        const mockSubmission: CertificateSubmission = {
          id: Date.now().toString(),
          certificate_type: newSubmission.certificate_type,
          certificate_name: newSubmission.certificate_name,
          certificate_number: newSubmission.certificate_number,
          course_name: newSubmission.course_name || undefined,
          training_course_name: newSubmission.training_course_name || undefined,
          training_hours: newSubmission.training_hours || undefined,
          conducted_from: newSubmission.conducted_from || undefined,
          conducted_to: newSubmission.conducted_to || undefined,
          given_date: newSubmission.given_date || undefined,
          date_accredited: newSubmission.date_accredited || undefined,
          expiration_date: newSubmission.expiration_date || undefined,
          file_url: '/certificates/temp-certificate.pdf',
          file_name: newSubmission.file!.name,
          status: 'pending',
          submitted_at: new Date().toISOString().split('T')[0]
        }

        updatedSubmissions = [mockSubmission, ...submissions]
        console.log('🔍 DEBUG: Created new certificate submission')
        setShowAddForm(false)
        alert('Certificate submitted successfully!')
      }

      // Update state
      setSubmissions(updatedSubmissions)
      
      // Save to localStorage
      try {
        localStorage.setItem('student-certificate-submissions', JSON.stringify(updatedSubmissions))
        console.log('🔍 DEBUG: Saved certificate submissions to localStorage')
      } catch (storageError) {
        console.error('🔍 DEBUG: Error saving certificate submissions to localStorage:', storageError)
      }

      // Reset form
      setNewSubmission({
        certificate_type: 'NC',
        certificate_name: '',
        certificate_number: '',
        course_name: '',
        training_course_name: '',
        training_hours: 0,
        conducted_from: '',
        conducted_to: '',
        given_date: '',
        date_accredited: '',
        expiration_date: '',
        file: null
      })
    } catch (error) {
      console.error('Error submitting certificate:', error)
      alert('Error submitting certificate. Please try again.')
    }
  }

  const renderCertificateForm = () => (
    <form onSubmit={handleSubmitCertificate} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Certificate Type *
        </label>
        <select
          value={newSubmission.certificate_type}
          onChange={(e) => setNewSubmission({ ...newSubmission, certificate_type: e.target.value as 'NC' | 'COC' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={!!editingSubmission}
        >
          <option value="NC">National Certificate (NC)</option>
          <option value="COC">Certificate of Competency (COC)</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Certificate Name *
        </label>
        <input
          type="text"
          value={newSubmission.certificate_name}
          onChange={(e) => setNewSubmission({ ...newSubmission, certificate_name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Food & Beverages Services NC II"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Certificate Number *
        </label>
        <input
          type="text"
          value={newSubmission.certificate_number}
          onChange={(e) => setNewSubmission({ ...newSubmission, certificate_number: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., FBS-2024-001"
          required
        />
      </div>

      {/* NC Certificate Fields */}
      {newSubmission.certificate_type === 'NC' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Name *
            </label>
            <input
              type="text"
              value={newSubmission.course_name}
              onChange={(e) => setNewSubmission({ ...newSubmission, course_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Restaurant Service Operations"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Accredited *
            </label>
            <input
              type="date"
              value={newSubmission.date_accredited}
              onChange={(e) => setNewSubmission({ ...newSubmission, date_accredited: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date
            </label>
            <input
              type="date"
              value={newSubmission.expiration_date}
              onChange={(e) => setNewSubmission({ ...newSubmission, expiration_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      )}

      {/* COC Certificate Fields */}
      {newSubmission.certificate_type === 'COC' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Training Course Name *
            </label>
            <input
              type="text"
              value={newSubmission.training_course_name}
              onChange={(e) => setNewSubmission({ ...newSubmission, training_course_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Basic Culinary Arts Training"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Training Hours *
            </label>
            <input
              type="number"
              value={newSubmission.training_hours}
              onChange={(e) => setNewSubmission({ ...newSubmission, training_hours: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 40"
              min="1"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conducted From *
              </label>
              <input
                type="date"
                value={newSubmission.conducted_from}
                onChange={(e) => setNewSubmission({ ...newSubmission, conducted_from: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conducted To *
              </label>
              <input
                type="date"
                value={newSubmission.conducted_to}
                onChange={(e) => setNewSubmission({ ...newSubmission, conducted_to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Given Date *
            </label>
            <input
              type="date"
              value={newSubmission.given_date}
              onChange={(e) => setNewSubmission({ ...newSubmission, given_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Certificate File *
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={!editingSubmission}
        />
        <p className="text-xs text-gray-500 mt-1">
          Accepted formats: PDF, JPG, PNG (Max 10MB)
          {editingSubmission && " • Leave empty to keep current file"}
        </p>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setShowAddForm(false)
            setShowEditForm(false)
            setEditingSubmission(null)
            setNewSubmission({
              certificate_type: 'NC',
              certificate_name: '',
              certificate_number: '',
              course_name: '',
              training_course_name: '',
              training_hours: 0,
              conducted_from: '',
              conducted_to: '',
              given_date: '',
              date_accredited: '',
              expiration_date: '',
              file: null
            })
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          {editingSubmission ? 'Update Certificate' : 'Submit Certificate'}
        </button>
      </div>
    </form>
  )

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
            <h1 className="text-3xl font-bold text-gray-900">My Certifications</h1>
            <p className="text-gray-600 mt-2">Manage your certificates and track TESDA certification progress.</p>
          </div>
          {activeTab === 'submissions' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              + Add Certificate
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
              My Certificates ({submissions.length})
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

      {/* Certificate Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
              <div className="text-sm text-gray-600">Total Submissions</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-green-600">
                {submissions.filter(s => s.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {submissions.filter(s => s.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-red-600">
                {submissions.filter(s => s.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>

          {/* Submissions List */}
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">📜</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{submission.certificate_name}</h3>
                      <p className="text-sm text-gray-600">{submission.certificate_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                      {submission.status.toUpperCase()}
                    </span>
                    {(submission.status === 'pending' || submission.status === 'rejected') && (
                      <button
                        onClick={() => handleEditSubmission(submission)}
                        className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="ml-2 font-medium">{submission.certificate_type}</span>
                  </div>
                  
                  {submission.certificate_type === 'NC' ? (
                    <>
                      <div>
                        <span className="text-sm text-gray-600">Course:</span>
                        <span className="ml-2 font-medium">{submission.course_name}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Date Accredited:</span>
                        <span className="ml-2 font-medium">{submission.date_accredited}</span>
                      </div>
                      {submission.expiration_date && (
                        <div>
                          <span className="text-sm text-gray-600">Expires:</span>
                          <span className="ml-2 font-medium">{submission.expiration_date}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-sm text-gray-600">Training Course:</span>
                        <span className="ml-2 font-medium">{submission.training_course_name}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Training Hours:</span>
                        <span className="ml-2 font-medium">{submission.training_hours}h</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Conducted:</span>
                        <span className="ml-2 font-medium">{submission.conducted_from} to {submission.conducted_to}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Given Date:</span>
                        <span className="ml-2 font-medium">{submission.given_date}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mb-4">
                  <span className="text-sm text-gray-600">Submitted:</span>
                  <span className="ml-2 font-medium">{submission.submitted_at}</span>
                  {submission.reviewed_at && (
                    <>
                      <span className="ml-4 text-sm text-gray-600">Reviewed:</span>
                      <span className="ml-2 font-medium">{submission.reviewed_at}</span>
                    </>
                  )}
                </div>

                {submission.remarks && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-1">Remarks:</div>
                    <div className="text-sm text-gray-600">{submission.remarks}</div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <a 
                      href={submission.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                    >
                      📄 View Certificate File
                    </a>
                  </div>
                  <div className="text-sm text-gray-500">
                    File: {submission.file_name}
                  </div>
                </div>
              </div>
            ))}

            {submissions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📜</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates submitted</h3>
                <p className="text-gray-600 mb-4">
                  Start by adding your first certificate for verification.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Add Certificate
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TESDA Certifications Tab */}
      {activeTab === 'tesda' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {certifications.map((cert) => (
            <div key={cert.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{getTypeIcon(cert.type)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{cert.name}</h3>
                    <p className="text-sm text-gray-600">{cert.code}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(cert.status)}`}>
                  {cert.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{cert.description}</p>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{cert.duration_hours} hours</span>
                </div>

                {cert.prerequisites.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Prerequisites:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {cert.prerequisites.map((prereq, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {prereq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-sm text-gray-600">Required Courses:</span>
                  <div className="mt-1 space-y-1">
                    {cert.requiredCourses.map((course, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          cert.completedCourses.includes(course)
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {cert.completedCourses.includes(course) ? '✓' : '○'}
                        </span>
                        <span className={cert.completedCourses.includes(course) ? 'text-green-600' : 'text-gray-600'}>
                          {course}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {cert.status !== 'not_applied' && cert.status !== 'completed' && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{cert.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${cert.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {cert.applicationDate && (
                <div className="text-sm text-gray-600 mb-2">
                  Applied: {cert.applicationDate}
                </div>
              )}

              {cert.examDate && (
                <div className="text-sm text-gray-600 mb-4">
                  Exam Date: {cert.examDate}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  {cert.certificateUrl && (
                    <a
                      href={cert.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:text-green-500 font-medium"
                    >
                      📄 Download Certificate
                    </a>
                  )}
                </div>
                <div className="space-x-2">
                  <a
                    href={`/student/certifications/${cert.id}`}
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                  >
                    View Details
                  </a>
                  {cert.status === 'not_applied' && cert.completedCourses.length === cert.requiredCourses.length && (
                    <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-medium">
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {certifications.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <div className="text-6xl mb-4">📜</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No TESDA certifications available</h3>
              <p className="text-gray-600">
                TESDA certification exams will be available once courses are completed.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Certificate Modal */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingSubmission ? 'Edit Certificate' : 'Add Certificate'}
            </h2>
            {renderCertificateForm()}
          </div>
        </div>
      )}
    </div>
  )
}