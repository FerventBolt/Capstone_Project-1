'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Eye, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/supabase-client'

interface Submission {
  id: string
  student_id: string
  assignment_id: string
  content: string
  file_name?: string
  file_url?: string
  status: 'submitted' | 'graded' | 'returned' | 'late'
  grade?: number
  feedback?: string
  submitted_at: string
}

interface Assignment {
  id: string
  title: string
  description: string
  due_date: string
  max_points: number
  instructions: string
}

interface Student {
  id: string
  full_name: string
  email: string
}

export default function AssignmentSubmissionsPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const assignmentId = params.assignmentId as string

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<(Submission & { student: Student | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<(Submission & { student: Student | null }) | null>(null)
  const [gradingMode, setGradingMode] = useState(false)
  const [gradeForm, setGradeForm] = useState({ grade: 0, feedback: '' })
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      // Fetch assignment details
      const { data: assignmentData } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', assignmentId)
        .single()
      setAssignment(assignmentData as Assignment)

      // Fetch submissions for this assignment
      const { data: submissionsData } = await supabase
        .from('submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false })

      // Fetch student info for each submission
      const submissionsWithStudent: (Submission & { student: Student | null })[] = []
      if (submissionsData && submissionsData.length > 0) {
        for (const sub of submissionsData as Submission[]) {
          let student: Student | null = null
          if (sub.student_id) {
            const { data: studentData } = await supabase
              .from('profiles')
              .select('id, full_name, email')
              .eq('id', sub.student_id)
              .single()
            student = studentData as Student
          }
          submissionsWithStudent.push({ ...sub, student })
        }
      }
      setSubmissions(submissionsWithStudent)
      setLoading(false)
    }
    if (assignmentId) loadData()
  }, [assignmentId])

  const filteredSubmissions = submissions.filter(submission => {
    if (filterStatus === 'all') return true
    return submission.status === filterStatus
  })

  const handleGradeSubmission = (submission: Submission & { student: Student | null }) => {
    setSelectedSubmission(submission)
    setGradeForm({
      grade: submission.grade || 0,
      feedback: submission.feedback || ''
    })
    setGradingMode(true)
  }

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return
    setLoading(true)
    await supabase
      .from('submissions')
      .update({
        grade: gradeForm.grade,
        feedback: gradeForm.feedback,
        status: 'graded'
      })
      .eq('id', selectedSubmission.id)
    // Refresh submissions
    setGradingMode(false)
    setSelectedSubmission(null)
    setGradeForm({ grade: 0, feedback: '' })
    // Reload data
    const { data: submissionsData } = await supabase
      .from('submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false })
    const submissionsWithStudent: (Submission & { student: Student | null })[] = []
    if (submissionsData && submissionsData.length > 0) {
      for (const sub of submissionsData as Submission[]) {
        let student: Student | null = null
        if (sub.student_id) {
          const { data: studentData } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('id', sub.student_id)
            .single()
          student = studentData as Student
        }
        submissionsWithStudent.push({ ...sub, student })
      }
    }
    setSubmissions(submissionsWithStudent)
    setLoading(false)
    alert('Grade saved successfully!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'graded': return 'bg-green-100 text-green-800'
      case 'returned': return 'bg-purple-100 text-purple-800'
      case 'late': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="w-4 h-4" />
      case 'graded': return <CheckCircle className="w-4 h-4" />
      case 'returned': return <MessageSquare className="w-4 h-4" />
      case 'late': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Assignment Not Found</h2>
          <Link href={`/staff/courses/${courseId}`} className="text-blue-600 hover:text-blue-500">
            ← Back to Course
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href={`/staff/courses/${courseId}`}
                className="text-gray-500 hover:text-gray-700 mr-4 flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Course
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{assignment.title}</h1>
                <p className="text-sm text-gray-500">Assignment Submissions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assignment Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Due Date</h3>
              <p className="text-gray-900">{new Date(assignment.due_date).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Max Points</h3>
              <p className="text-gray-900">{assignment.max_points} points</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Submissions</h3>
              <p className="text-gray-900">{submissions.length} received</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-900">{assignment.description}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Submissions</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
                <option value="late">Late</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Showing {filteredSubmissions.length} of {submissions.length}</span>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <div key={submission.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {submission.student?.full_name
                        ? submission.student.full_name.split(' ').map(n => n[0]).join('')
                        : '??'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{submission.student?.full_name ?? 'Unknown Student'}</h4>
                    <p className="text-sm text-gray-600">{submission.student?.email ?? ''}</p>
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                    {getStatusIcon(submission.status)}
                    <span className="ml-1">{submission.status.toUpperCase()}</span>
                  </span>
                  {submission.status === 'graded' && (
                    <span className="text-sm font-medium text-green-600">
                      {submission.grade}/{assignment.max_points}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Submission Content:</h5>
                <div className="bg-gray-50 p-4 rounded border">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{submission.content}</p>
                  {submission.file_name && (
                    <div className="mt-3 flex items-center text-sm text-blue-600">
                      <Download className="w-4 h-4 mr-1" />
                      <a href={submission.file_url} className="hover:underline">
                        {submission.file_name}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {submission.status === 'graded' && submission.feedback && (
                <div className="mb-4 bg-green-50 p-4 rounded border">
                  <h5 className="text-sm font-medium text-green-800 mb-2">Feedback:</h5>
                  <p className="text-sm text-green-700">{submission.feedback}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  {submission.file_name && (
                    <a
                      href={submission.file_url}
                      className="text-green-600 hover:text-green-500 text-sm font-medium flex items-center space-x-1"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleGradeSubmission(submission)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {submission.status === 'graded' ? 'Update Grade' : 'Grade Submission'}
                </button>
              </div>
            </div>
          ))}

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-500">
                {filterStatus === 'all' 
                  ? 'No students have submitted this assignment yet.'
                  : `No submissions with status "${filterStatus}" found.`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Grading Modal */}
      {gradingMode && selectedSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Grade Submission - {selectedSubmission.student?.full_name ?? 'Unknown Student'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade (0-{assignment.max_points})
                </label>
                <input
                  type="number"
                  min="0"
                  max={assignment.max_points}
                  value={gradeForm.grade}
                  onChange={(e) => setGradeForm({ ...gradeForm, grade: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback
                </label>
                <textarea
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide feedback to the student..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveGrade}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Save Grade
              </button>
              <button
                onClick={() => {
                  setGradingMode(false)
                  setSelectedSubmission(null)
                  setGradeForm({ grade: 0, feedback: '' })
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedSubmission && !gradingMode && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Submission Details - {selectedSubmission.student?.full_name ?? 'Unknown Student'}
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student</label>
                  <p className="text-gray-900">{selectedSubmission.student?.full_name ?? 'Unknown Student'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Submitted</label>
                  <p className="text-gray-900">{new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <div className="bg-gray-50 p-4 rounded border">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedSubmission.content}</p>
                </div>
              </div>

              {selectedSubmission.file_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attached File</label>
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4 text-blue-600" />
                    <a href={selectedSubmission.file_url} className="text-blue-600 hover:underline">
                      {selectedSubmission.file_name}
                    </a>
                  </div>
                </div>
              )}

              {selectedSubmission.status === 'graded' && (
                <div className="bg-green-50 p-4 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800">
                      Grade: {selectedSubmission.grade}/{assignment.max_points}
                    </span>
                  </div>
                  {selectedSubmission.feedback && (
                    <div>
                      <p className="text-sm font-medium text-green-800 mb-1">Feedback:</p>
                      <p className="text-sm text-green-700">{selectedSubmission.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setSelectedSubmission(null)
                  handleGradeSubmission(selectedSubmission)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                {selectedSubmission.status === 'graded' ? 'Update Grade' : 'Grade Submission'}
              </button>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium"
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