'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, FileText, User } from 'lucide-react'

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

export default function GradeSubmissionPage() {
  const params = useParams()
  const router = useRouter()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [score, setScore] = useState<number>(0)
  const [feedback, setFeedback] = useState<string>('')

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        console.log('DEBUG: Fetching submission for grading with ID:', params.id)
        
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
        setScore(mockSubmission.score || 0)
        setFeedback(mockSubmission.feedback || '')
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

  const handleSaveGrade = async () => {
    if (!submission) return

    setSaving(true)
    try {
      console.log('DEBUG: Saving grade:', { id: submission.id, score, feedback })
      
      // TODO: Implement API call to save grade
      // Mock save
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Grade saved successfully!')
      router.push('/staff/grading')
    } catch (error) {
      console.error('Error saving grade:', error)
      alert('Failed to save grade')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPercentage = () => {
    if (!submission) return 0
    return Math.round((score / submission.max_score) * 100)
  }

  const getGradeColor = () => {
    const percentage = getPercentage()
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
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
              href={`/staff/grading/${submission.id}`}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Grade Submission</h1>
              <p className="text-gray-600 mt-2">Assign score and provide feedback</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSaveGrade}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
            >
              {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Grade'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grading Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score Input */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points Earned
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={submission.max_score}
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-400">/</span>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Points
                  </label>
                  <input
                    type="number"
                    value={submission.max_score}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Percentage:</span>
                  <span className={`text-lg font-bold ${getGradeColor()}`}>
                    {getPercentage()}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Provide detailed feedback to help the student improve..."
            />
            <div className="mt-2 text-sm text-gray-500">
              {feedback.length} characters
            </div>
          </div>

          {/* Submission Review */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Review</h3>
            
            {submission.submission_content && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Content</h4>
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
                      <button className="text-blue-600 hover:text-blue-500 text-sm font-medium flex items-center space-x-1">
                        {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Student Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student</h3>
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
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
              <User className="w-4 h-4" />
              <span>View Profile</span>
            </button>
          </div>

          {/* Assessment Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment</h3>
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
                <p className="text-sm text-gray-900 capitalize">{submission.assessment_type}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Submitted:</span>
                <p className="text-sm text-gray-900">{formatDate(submission.submitted_at)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Due:</span>
                <p className="text-sm text-gray-900">{formatDate(submission.due_date)}</p>
              </div>
            </div>
          </div>

          {/* Grading Rubric */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Grading Scale</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>A (90-100%)</span>
                <span className="text-green-600">Excellent</span>
              </div>
              <div className="flex justify-between">
                <span>B (80-89%)</span>
                <span className="text-blue-600">Good</span>
              </div>
              <div className="flex justify-between">
                <span>C (70-79%)</span>
                <span className="text-yellow-600">Satisfactory</span>
              </div>
              <div className="flex justify-between">
                <span>D (60-69%)</span>
                <span className="text-orange-600">Needs Improvement</span>
              </div>
              <div className="flex justify-between">
                <span>F (0-59%)</span>
                <span className="text-red-600">Failing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}