'use client'

import { useState, useEffect } from 'react'

interface TESDAExam {
  id: string
  title: string
  certificationType: 'Food & Beverages Services NC II' | 'Front Office Services NC II' | 'Housekeeping Services NC II' | 'Tourism Promotion Services NC III' | 'Commercial Cooking NC II'
  examDate: string
  examTime: string
  venue: string
  maxCandidates: number
  registeredCandidates: number
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  registrationDeadline: string
  proctor: string
  requirements: string[]
  createdAt: string
}

interface ExamRegistration {
  id: string
  examId: string
  studentId: string
  studentName: string
  studentEmail: string
  registrationDate: string
  attendanceStatus: 'registered' | 'present' | 'absent'
  examResult?: 'passed' | 'failed' | 'pending'
  score?: number
}

export default function TESDAExamsPage() {
  const [exams, setExams] = useState<TESDAExam[]>([])
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState<TESDAExam | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)
  const [managingExam, setManagingExam] = useState<TESDAExam | null>(null)
  const [newExam, setNewExam] = useState({
    title: '',
    certificationType: '' as any,
    examDate: '',
    examTime: '',
    venue: '',
    maxCandidates: 0,
    registrationDeadline: '',
    proctor: '',
    requirements: ['Valid ID', 'Certificate of Training Completion']
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 DEBUG: Fetching exams from API and localStorage...')
        
        // Get default exams and registrations from API
        const response = await fetch('/api/admin/exams', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        let defaultExams = []
        let defaultRegistrations = []
        if (response.ok) {
          const result = await response.json()
          defaultExams = result.exams || []
          defaultRegistrations = result.registrations || []
          console.log('🔍 DEBUG: Successfully fetched default data:', defaultExams.length, 'exams,', defaultRegistrations.length, 'registrations')
        } else {
          console.error('🔍 DEBUG: Failed to fetch default data, using empty arrays')
        }
        
        // Get user-created exams from localStorage
        let userCreatedExams = []
        try {
          const storedExams = localStorage.getItem('demo-exams')
          if (storedExams) {
            userCreatedExams = JSON.parse(storedExams)
            console.log('🔍 DEBUG: Found user-created exams in localStorage:', userCreatedExams.length)
          }
        } catch (storageError) {
          console.error('🔍 DEBUG: Error reading exams from localStorage:', storageError)
        }
        
        // Get user-created registrations from localStorage
        let userCreatedRegistrations = []
        try {
          const storedRegistrations = localStorage.getItem('demo-exam-registrations')
          if (storedRegistrations) {
            userCreatedRegistrations = JSON.parse(storedRegistrations)
            console.log('🔍 DEBUG: Found user-created registrations in localStorage:', userCreatedRegistrations.length)
          }
        } catch (storageError) {
          console.error('🔍 DEBUG: Error reading registrations from localStorage:', storageError)
        }
        
        // Merge default data with user-created data
        const allExams = [...defaultExams, ...userCreatedExams]
        const allRegistrations = [...defaultRegistrations, ...userCreatedRegistrations]
        console.log('🔍 DEBUG: Total data (default + user-created):', allExams.length, 'exams,', allRegistrations.length, 'registrations')
        
        setExams(allExams)
        setRegistrations(allRegistrations)
      } catch (error) {
        console.error('Error fetching data:', error)
        // Fallback: try to load from localStorage only
        try {
          const storedExams = localStorage.getItem('demo-exams')
          const storedRegistrations = localStorage.getItem('demo-exam-registrations')
          if (storedExams) {
            const exams = JSON.parse(storedExams)
            console.log('🔍 DEBUG: Fallback: loaded exams from localStorage only:', exams.length)
            setExams(exams)
          } else {
            setExams([])
          }
          if (storedRegistrations) {
            const registrations = JSON.parse(storedRegistrations)
            setRegistrations(registrations)
          } else {
            setRegistrations([])
          }
        } catch (fallbackError) {
          console.error('🔍 DEBUG: Fallback also failed:', fallbackError)
          setExams([])
          setRegistrations([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔍 DEBUG: Creating new exam:', newExam)

    try {
      // Call API to create exam
      const response = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExam),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('🔍 DEBUG: Exam created successfully:', result.exam)
        
        // Add to local state
        const newExamRecord = result.exam
        const updatedExams = [newExamRecord, ...exams]
        setExams(updatedExams)
        
        // Save to localStorage (only user-created exams)
        const userCreatedExams = updatedExams.filter(exam => 
          !exam.id.startsWith('default-')
        )
        localStorage.setItem('demo-exams', JSON.stringify(userCreatedExams))
        console.log('🔍 DEBUG: Saved new exam to localStorage')
        
        // Reset form and close modal
        setNewExam({
          title: '',
          certificationType: '' as any,
          examDate: '',
          examTime: '',
          venue: '',
          maxCandidates: 0,
          registrationDeadline: '',
          proctor: '',
          requirements: ['Valid ID', 'Certificate of Training Completion']
        })
        setShowCreateModal(false)
        alert('Exam scheduled successfully!')
      } else {
        console.error('🔍 DEBUG: Failed to create exam')
        alert('Failed to schedule exam. Please try again.')
      }
    } catch (error) {
      console.error('🔍 DEBUG: Error creating exam:', error)
      alert('Error scheduling exam. Please try again.')
    }
  }

  const handleManageExam = async (action: string, examId: string) => {
    console.log('🔍 DEBUG: Managing exam:', { action, examId })

    try {
      if (action === 'cancel') {
        // Call API to update exam
        const examToUpdate = exams.find(e => e.id === examId)
        if (!examToUpdate) return

        const response = await fetch('/api/admin/exams', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...examToUpdate, status: 'cancelled' }),
        })

        if (response.ok) {
          console.log('🔍 DEBUG: Exam cancelled successfully')
          
          // Update local state
          const updatedExams = exams.map(exam =>
            exam.id === examId ? { ...exam, status: 'cancelled' as const } : exam
          )
          setExams(updatedExams)
          
          // Save to localStorage (only user-created exams)
          const userCreatedExams = updatedExams.filter(exam => 
            !exam.id.startsWith('default-')
          )
          localStorage.setItem('demo-exams', JSON.stringify(userCreatedExams))
          console.log('🔍 DEBUG: Updated exam saved to localStorage')
          
          alert('Exam cancelled successfully!')
        } else {
          console.error('🔍 DEBUG: Failed to cancel exam')
          alert('Failed to cancel exam. Please try again.')
        }
      } else if (action === 'complete') {
        // Call API to update exam
        const examToUpdate = exams.find(e => e.id === examId)
        if (!examToUpdate) return

        const response = await fetch('/api/admin/exams', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...examToUpdate, status: 'completed' }),
        })

        if (response.ok) {
          console.log('🔍 DEBUG: Exam completed successfully')
          
          // Update local state
          const updatedExams = exams.map(exam =>
            exam.id === examId ? { ...exam, status: 'completed' as const } : exam
          )
          setExams(updatedExams)
          
          // Save to localStorage (only user-created exams)
          const userCreatedExams = updatedExams.filter(exam => 
            !exam.id.startsWith('default-')
          )
          localStorage.setItem('demo-exams', JSON.stringify(userCreatedExams))
          console.log('🔍 DEBUG: Updated exam saved to localStorage')
          
          alert('Exam marked as completed!')
        } else {
          console.error('🔍 DEBUG: Failed to complete exam')
          alert('Failed to complete exam. Please try again.')
        }
      } else if (action === 'delete') {
        if (confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
          // Call API to delete exam
          const response = await fetch('/api/admin/exams', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: examId }),
          })

          if (response.ok) {
            console.log('🔍 DEBUG: Exam deleted successfully')
            
            // Update local state
            const updatedExams = exams.filter(exam => exam.id !== examId)
            setExams(updatedExams)
            
            // Save to localStorage (only user-created exams)
            const userCreatedExams = updatedExams.filter(exam => 
              !exam.id.startsWith('default-')
            )
            localStorage.setItem('demo-exams', JSON.stringify(userCreatedExams))
            console.log('🔍 DEBUG: Updated localStorage after deletion')
            
            alert('Exam deleted successfully!')
          } else {
            console.error('🔍 DEBUG: Failed to delete exam')
            alert('Failed to delete exam. Please try again.')
          }
        }
      }
      
      setShowManageModal(false)
      setManagingExam(null)
    } catch (error) {
      console.error('🔍 DEBUG: Error managing exam:', error)
      alert('Error managing exam. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'ongoing': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getExamRegistrations = (examId: string) => {
    return registrations.filter(reg => reg.examId === examId)
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
            <h1 className="text-3xl font-bold text-gray-900">TESDA Exams</h1>
            <p className="text-gray-600 mt-2">Schedule and manage TESDA certification examinations</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Schedule New Exam
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{exams.length}</div>
          <div className="text-sm text-gray-600">Total Exams</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {exams.filter(exam => exam.status === 'scheduled').length}
          </div>
          <div className="text-sm text-gray-600">Scheduled</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {exams.filter(exam => exam.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {exams.reduce((sum, exam) => sum + exam.registeredCandidates, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Registrations</div>
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{exam.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{exam.certificationType}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(exam.status)}`}>
                {exam.status}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date & Time:</span>
                <span className="font-medium">{new Date(exam.examDate).toLocaleDateString()} at {exam.examTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Venue:</span>
                <span className="font-medium">{exam.venue}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Proctor:</span>
                <span className="font-medium">{exam.proctor}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Registration:</span>
                <span className="font-medium">{exam.registeredCandidates}/{exam.maxCandidates}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Registration Deadline:</span>
                <span className="font-medium">{new Date(exam.registrationDeadline).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(exam.registeredCandidates / exam.maxCandidates) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedExam(exam)
                  setShowDetailsModal(true)
                }}
                className="flex-1 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => {
                  setManagingExam(exam)
                  setShowManageModal(true)
                }}
                className="flex-1 text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
              >
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule New TESDA Exam</h3>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title</label>
                  <input
                    type="text"
                    required
                    value={newExam.title}
                    onChange={(e) => setNewExam(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Food & Beverages Services NC II Assessment"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certification Type</label>
                  <select
                    required
                    value={newExam.certificationType}
                    onChange={(e) => setNewExam(prev => ({ ...prev, certificationType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Certification Type</option>
                    <option value="Food & Beverages Services NC II">Food & Beverages Services NC II</option>
                    <option value="Front Office Services NC II">Front Office Services NC II</option>
                    <option value="Housekeeping Services NC II">Housekeeping Services NC II</option>
                    <option value="Tourism Promotion Services NC III">Tourism Promotion Services NC III</option>
                    <option value="Commercial Cooking NC II">Commercial Cooking NC II</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={newExam.examDate}
                    onChange={(e) => setNewExam(prev => ({ ...prev, examDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Time</label>
                  <input
                    type="time"
                    required
                    value={newExam.examTime}
                    onChange={(e) => setNewExam(prev => ({ ...prev, examTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                  <input
                    type="text"
                    required
                    value={newExam.venue}
                    onChange={(e) => setNewExam(prev => ({ ...prev, venue: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., LPU Cavite - Assessment Center Room 101"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Candidates</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newExam.maxCandidates || ''}
                    onChange={(e) => setNewExam(prev => ({ ...prev, maxCandidates: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Deadline</label>
                  <input
                    type="date"
                    required
                    value={newExam.registrationDeadline}
                    onChange={(e) => setNewExam(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proctor</label>
                  <input
                    type="text"
                    required
                    value={newExam.proctor}
                    onChange={(e) => setNewExam(prev => ({ ...prev, proctor: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex-1">
                  Schedule Exam
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam Details Modal */}
      {showDetailsModal && selectedExam && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedExam.title} - Registrations
            </h3>
            
            <div className="mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Date & Time</div>
                  <div className="font-medium">{new Date(selectedExam.examDate).toLocaleDateString()} at {selectedExam.examTime}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Venue</div>
                  <div className="font-medium">{selectedExam.venue}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Registered</div>
                  <div className="font-medium">{selectedExam.registeredCandidates}/{selectedExam.maxCandidates}</div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getExamRegistrations(selectedExam.id).map((registration) => (
                    <tr key={registration.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{registration.studentName}</div>
                        <div className="text-sm text-gray-500">{registration.studentEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(registration.registrationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.attendanceStatus}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {registration.examResult ? (
                          <div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              registration.examResult === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {registration.examResult}
                            </span>
                            {registration.score && (
                              <div className="text-xs text-gray-500 mt-1">Score: {registration.score}%</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedExam(null)
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Exam Modal */}
      {showManageModal && managingExam && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Manage Exam: {managingExam.title}
            </h3>
            
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">
                <strong>Status:</strong> <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(managingExam.status)}`}>
                  {managingExam.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <strong>Date:</strong> {new Date(managingExam.examDate).toLocaleDateString()} at {managingExam.examTime}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <strong>Registered:</strong> {managingExam.registeredCandidates}/{managingExam.maxCandidates}
              </div>
            </div>
            
            <div className="space-y-3">
              {managingExam.status === 'scheduled' && (
                <>
                  <button
                    onClick={() => handleManageExam('complete', managingExam.id)}
                    className="w-full text-sm bg-green-50 text-green-600 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors"
                  >
                    Mark as Completed
                  </button>
                  <button
                    onClick={() => handleManageExam('cancel', managingExam.id)}
                    className="w-full text-sm bg-yellow-50 text-yellow-600 hover:bg-yellow-100 px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel Exam
                  </button>
                </>
              )}
              
              {managingExam.status === 'ongoing' && (
                <button
                  onClick={() => handleManageExam('complete', managingExam.id)}
                  className="w-full text-sm bg-green-50 text-green-600 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors"
                >
                  Mark as Completed
                </button>
              )}
              
              <button
                onClick={() => handleManageExam('delete', managingExam.id)}
                className="w-full text-sm bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
              >
                Delete Exam
              </button>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowManageModal(false)
                  setManagingExam(null)
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}