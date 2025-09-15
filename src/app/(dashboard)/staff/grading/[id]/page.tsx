'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Clock, FileText, Download, Eye, Edit, MessageCircle } from 'lucide-react'

interface Submission {
  id: string
  student_id: string
  student_name: string
  student_email: string
  assessment_id: string
  assessment_title: string
  course_name: string
  assessment_type: 'quiz' | 'assignment' | 'practical' | 'exam'
  submitted_at: string
  due_date: string
  status: 'pending' | 'graded' | 'late' | 'missing'
  score: number | null
  max_score: number
  feedback: string | null
  submission_files: string[]
  attempt_number: number
  time_spent_minutes: number | null
  submission_content?: string
  answers?: { question: string; answer: string; correct?: boolean }[]
}

export default function SubmissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        console.log('DEBUG: Fetching submission with ID:', params.id)
        
        // Mock data for now - replace with actual API call
        const mockSubmission: Submission = {
          id: params.id as string,
          student_id: '1',
          student_name: 'Juan Dela Cruz',
          student_email: 'juan.delacruz@lpunetwork.edu.ph',
          assessment_id: '1',
          assessment_title: 'Restaurant Service Basics Quiz',
          course_name: 'Restaurant Service Operations',
          assessment_type: 'quiz',
          submitted_at: '2024-02-10T14:30:00Z',
          due_date: '2024-02-15T23:59:59Z',
          status: 'pending',
          score: null,
          max_score: 100,
          feedback: null,
          submission_files: [],
          attempt_number: 1,
          time_spent_minutes: 25,
          submission_content: 'This is the student\'s submission content for the restaurant service basics quiz.',
          answers: [
            {
              question: 'What is the proper way to greet customers?',
              answer: 'Good evening, welcome to our restaurant. My name is Juan and I will be your server tonight.',
              correct: true
            },
            {
              question: 'How should you handle customer complaints?',
              answer: 'Listen carefully, apologize sincerely, and find a solution quickly.',
              correct: true
            },
            {
              question: 'What is the standard table setting order?',
              answer: 'Fork on left, knife and spoon on right, bread plate on upper left.',
              correct: false
            }
          ]
        }
        
        setSubmission(mockSubmission)
      } catch (error) {
        console.error('Error fetching submission:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchSubmission()
    }
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'graded': return 'bg-green-100 text-green-800'
      case 'late': return 'bg-red-100 text-red-800'
      case 'missing': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quiz': return 'bg-blue-100 text-blue-800'
      case 'assignment': return 'bg-green-100 text-green-800'
      case 'practical': return 'bg-purple-100 text-purple-800'
      case 'exam': return 'bg-red-100 text-red-800'
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

  if (!submission) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Submission Not Found</h1>
          <p className="text-gray-600 mb-6">The submission you're looking for doesn't exist.</p>
          {/* @ts-expect-error - Next.js Link component type issue with strict TypeScript */}
          <Link href="/staff/grading" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            Back to Grading
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
          <div className="flex items-center space-x-4">
            {/* @ts-expect-error - Next.js Link component type issue with strict TypeScript */}
            <Link
              href="/staff/grading"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Submission Details</h1>
              <p className="text-gray-600 mt-2">Review student submission and provide feedback</p>
            </div>
          </div>
          <div className="flex space-x-3">
            {(submission.status === 'pending' || submission.status === 'late') && (
              /* @ts-expect-error - Next.js Link component type issue with strict TypeScript */
              <Link
                href={`/staff/grading/${submission.id}/grade`}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                <Edit className="w-4 h-4" />
                <span>Grade Submission</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Content</h3>
            
            {submission.submission_content && (
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{submission.submission_content}</p>
                </div>
              </div>
            )}

            {submission.answers && submission.answers.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Quiz Answers</h4>
                {submission.answers.map((answer, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">Question {index + 1}:</span>
                      <p className="text-gray-900 mt-1">{answer.question}</p>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">Answer:</span>
                      <p className="text-gray-900 mt-1">{answer.answer}</p>
                    </div>
                    {answer.correct !== undefined && (
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          answer.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {answer.correct ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {submission.submission_files.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Submitted Files</h4>
                <div className="space-y-2">
                  {submission.submission_files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{file}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-500 text-sm font-medium flex items-center space-x-1">
                          {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        <button className="text-green-600 hover:text-green-500 text-sm font-medium flex items-center space-x-1">
                          {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current Grade & Feedback */}
          {submission.score !== null && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Grade & Feedback</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Score:</span>
                  <p className="text-lg font-semibold text-green-600">
                    {submission.score}/{submission.max_score} ({Math.round((submission.score / submission.max_score) * 100)}%)
                  </p>
                </div>
                {submission.feedback && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Feedback:</span>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{submission.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Student Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-blue-600">
                  {submission.student_name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{submission.student_name}</p>
                <p className="text-sm text-gray-500">{submission.student_email}</p>
              </div>
            </div>
          </div>

          {/* Assessment Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Title:</span>
                <p className="text-sm text-gray-900">{submission.assessment_title}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Course:</span>
                <p className="text-sm text-gray-900">{submission.course_name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Type:</span>
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(submission.assessment_type)}`}>
                  {submission.assessment_type}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                  {submission.status}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Max Score:</span>
                <p className="text-sm text-gray-900">{submission.max_score} points</p>
              </div>
            </div>
          </div>

          {/* Submission Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Submitted:</span>
                <p className="text-sm text-gray-900">{formatDate(submission.submitted_at)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Due Date:</span>
                <p className="text-sm text-gray-900">{formatDate(submission.due_date)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Attempt:</span>
                <p className="text-sm text-gray-900">#{submission.attempt_number}</p>
              </div>
              {submission.time_spent_minutes && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Time Spent:</span>
                  <p className="text-sm text-gray-900">{submission.time_spent_minutes} minutes</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                <MessageCircle className="w-4 h-4" />
                <span>Send Message</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                <User className="w-4 h-4" />
                <span>View Student Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}