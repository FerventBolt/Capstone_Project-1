'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Eye, Edit, CheckCircle, Clock, FileText, User, BarChart3, MessageCircle, Download } from 'lucide-react'

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
}

// Mock data
const mockSubmissions: Submission[] = [
  {
    id: '1',
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
    time_spent_minutes: 25
  },
  {
    id: '2',
    student_id: '2',
    student_name: 'Maria Santos',
    student_email: 'maria.santos@lpunetwork.edu.ph',
    assessment_id: '2',
    assessment_title: 'Table Setting Practical Assessment',
    course_name: 'Restaurant Service Operations',
    assessment_type: 'practical',
    submitted_at: '2024-02-18T16:45:00Z',
    due_date: '2024-02-20T23:59:59Z',
    status: 'pending',
    score: null,
    max_score: 50,
    feedback: null,
    submission_files: ['table_setting_video.mp4', 'setup_photos.zip'],
    attempt_number: 1,
    time_spent_minutes: null
  },
  {
    id: '3',
    student_id: '3',
    student_name: 'Carlos Mendoza',
    student_email: 'carlos.mendoza@lpunetwork.edu.ph',
    assessment_id: '3',
    assessment_title: 'Cocktail Recipe Assignment',
    course_name: 'Bar Operations and Beverage Service',
    assessment_type: 'assignment',
    submitted_at: '2024-02-22T10:15:00Z',
    due_date: '2024-02-25T23:59:59Z',
    status: 'graded',
    score: 42,
    max_score: 75,
    feedback: 'Good creativity in recipes, but missing some preparation details. Please include more specific measurements.',
    submission_files: ['cocktail_recipes.pdf', 'ingredient_list.docx'],
    attempt_number: 1,
    time_spent_minutes: null
  },
  {
    id: '4',
    student_id: '4',
    student_name: 'Ana Rodriguez',
    student_email: 'ana.rodriguez@lpunetwork.edu.ph',
    assessment_id: '1',
    assessment_title: 'Restaurant Service Basics Quiz',
    course_name: 'Restaurant Service Operations',
    assessment_type: 'quiz',
    submitted_at: '2024-02-14T20:30:00Z',
    due_date: '2024-02-15T23:59:59Z',
    status: 'graded',
    score: 95,
    max_score: 100,
    feedback: 'Excellent work! Shows strong understanding of restaurant service principles.',
    submission_files: [],
    attempt_number: 1,
    time_spent_minutes: 28
  },
  {
    id: '5',
    student_id: '5',
    student_name: 'Roberto Garcia',
    student_email: 'roberto.garcia@lpunetwork.edu.ph',
    assessment_id: '3',
    assessment_title: 'Cocktail Recipe Assignment',
    course_name: 'Bar Operations and Beverage Service',
    assessment_type: 'assignment',
    submitted_at: '2024-02-26T08:30:00Z',
    due_date: '2024-02-25T23:59:59Z',
    status: 'late',
    score: null,
    max_score: 75,
    feedback: null,
    submission_files: ['late_submission.pdf'],
    attempt_number: 1,
    time_spent_minutes: null
  }
]

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  graded: 'bg-green-100 text-green-800',
  late: 'bg-red-100 text-red-800',
  missing: 'bg-gray-100 text-gray-800'
}

const statusIcons = {
  pending: Clock,
  graded: CheckCircle,
  late: Clock,
  missing: FileText
}

const assessmentTypeColors = {
  quiz: 'bg-blue-100 text-blue-800',
  assignment: 'bg-green-100 text-green-800',
  practical: 'bg-purple-100 text-purple-800',
  exam: 'bg-red-100 text-red-800'
}

export default function StaffGradingPage() {
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('pending')
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Get unique courses for filter
  const courses = Array.from(new Set(submissions.map(submission => submission.course_name)))

  // Filter submissions
  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.assessment_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.student_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || submission.status === selectedStatus
    const matchesCourse = selectedCourse === 'all' || submission.course_name === selectedCourse
    const matchesType = selectedType === 'all' || submission.assessment_type === selectedType
    return matchesSearch && matchesStatus && matchesCourse && matchesType
  })

  // Statistics
  const stats = {
    totalSubmissions: submissions.length,
    pendingGrading: submissions.filter(s => s.status === 'pending' || s.status === 'late').length,
    gradedToday: submissions.filter(s => s.status === 'graded').length,
    avgScore: Math.round(submissions.filter(s => s.score !== null).reduce((sum, s) => sum + (s.score! / s.max_score * 100), 0) / submissions.filter(s => s.score !== null).length) || 0
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

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const isOverdue = (dueDateString: string) => {
    return new Date(dueDateString) < new Date()
  }

  const handleQuickGrade = (submissionId: string, score: number, feedback: string) => {
    setSubmissions(prev => 
      prev.map(sub => 
        sub.id === submissionId 
          ? { ...sub, status: 'graded' as const, score, feedback }
          : sub
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grading Center</h1>
          <p className="text-gray-600 mt-1">Review and grade student submissions</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
            {/*  - Lucide icon type issue with strict TypeScript */}
            <Download className="w-4 h-4" />
            <span>Export Grades</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
            </div>
            {/*  - Lucide icon type issue with strict TypeScript */}
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Grading</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingGrading}</p>
            </div>
            {/*  - Lucide icon type issue with strict TypeScript */}
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Graded</p>
              <p className="text-2xl font-bold text-gray-900">{stats.gradedToday}</p>
            </div>
            {/*  - Lucide icon type issue with strict TypeScript */}
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgScore}%</p>
            </div>
            {/*  - Lucide icon type issue with strict TypeScript */}
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                {/*  - Lucide icon type issue with strict TypeScript */}
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="graded">Graded</option>
              <option value="late">Late</option>
              <option value="missing">Missing</option>
            </select>
            
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="quiz">Quiz</option>
              <option value="assignment">Assignment</option>
              <option value="practical">Practical</option>
              <option value="exam">Exam</option>
            </select>
          </div>
        </div>

        {/* Submissions List */}
        <div className="p-6">
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => {
              const StatusIcon = statusIcons[submission.status]
              const overdue = isOverdue(submission.due_date)
              
              return (
                <div key={submission.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-blue-600">
                          {submission.student_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{submission.student_name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusColors[submission.status]}`}>
                            {/*  - Lucide icon type issue with strict TypeScript */}
                            <StatusIcon className="w-3 h-3" />
                            <span className="capitalize">{submission.status}</span>
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${assessmentTypeColors[submission.assessment_type]}`}>
                            {submission.assessment_type}
                          </span>
                          {submission.status === 'late' && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Late Submission
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-1">{submission.assessment_title}</p>
                        <p className="text-sm text-blue-600 mb-3">{submission.course_name}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-500">Submitted:</span>
                            <span className="ml-1">{formatDate(submission.submitted_at)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Due:</span>
                            <span className={`ml-1 ${overdue ? 'text-red-600' : ''}`}>
                              {formatDate(submission.due_date)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Max Score:</span>
                            <span className="ml-1">{submission.max_score} points</span>
                          </div>
                          {submission.time_spent_minutes && (
                            <div>
                              <span className="text-gray-500">Time:</span>
                              <span className="ml-1">{submission.time_spent_minutes} min</span>
                            </div>
                          )}
                        </div>
                        
                        {submission.submission_files.length > 0 && (
                          <div className="mb-3">
                            <span className="text-sm text-gray-500">Files:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {submission.submission_files.map((file, index) => (
                                <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {file}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {submission.score !== null && (
                          <div className="mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Score:</span>
                              <span className={`font-medium ${getScoreColor(submission.score, submission.max_score)}`}>
                                {submission.score}/{submission.max_score} ({Math.round((submission.score / submission.max_score) * 100)}%)
                              </span>
                            </div>
                            {submission.feedback && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">{submission.feedback}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {/*  - Next.js Link component type issue with strict TypeScript */}
                      <Link
                        href={`/staff/grading/${submission.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Submission"
                      >
                        {/*  - Lucide icon type issue with strict TypeScript */}
                        <Eye className="w-4 h-4" />
                      </Link>
                      {(submission.status === 'pending' || submission.status === 'late') && (
                        /*  - Next.js Link component type issue with strict TypeScript */
                        <Link
                          href={`/staff/grading/${submission.id}/grade`}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Grade Submission"
                        >
                          {/*  - Lucide icon type issue with strict TypeScript */}
                          <Edit className="w-4 h-4" />
                        </Link>
                      )}
                      <button
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Send Feedback"
                      >
                        {/*  - Lucide icon type issue with strict TypeScript */}
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              {/*  - Lucide icon type issue with strict TypeScript */}
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedStatus !== 'all' || selectedCourse !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No submissions are available for grading'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}