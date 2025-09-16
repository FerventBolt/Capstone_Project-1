'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Play, FileText, Download, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { initializeCourseContent, isCourseContentInitialized, markCourseContentInitialized } from '@/lib/initialize-course-content'

interface Course {
  id: string
  title: string
  code: string
  description: string
  instructor: string
  category: string
}

interface Lesson {
  id: string
  title: string
  description: string
  content: string
  duration: number
  materials: Material[]
  assignments: Assignment[]
  order: number
  isPublished: boolean
  isCompleted?: boolean
  completedAt?: string
}

interface Material {
  id: string
  name: string
  type: 'pdf' | 'video' | 'document' | 'link'
  url: string
  size?: string
}

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  status: 'draft' | 'published'
  maxPoints?: number
  instructions?: string
  submissionStatus?: 'not_submitted' | 'submitted' | 'graded'
  grade?: number
  feedback?: string
  submittedAt?: string
}

interface Submission {
  assignmentId: string
  content: string
  fileName?: string
  submittedAt: string
  status: 'submitted' | 'graded'
  grade?: number
  feedback?: string
}

export default function StudentLessonPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'content' | 'materials' | 'assignments'>('content')
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissionText, setSubmissionText] = useState('')
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        // Initialize course content if not already done
        if (!isCourseContentInitialized()) {
          initializeCourseContent()
          markCourseContentInitialized()
          console.log('🔍 DEBUG: Course content initialized')
        }
        
        // Get course data
        const response = await fetch('/api/admin/courses')
        let allCourses: Course[] = []
        
        if (response.ok) {
          const result = await response.json()
          allCourses = [...(result.courses || [])]
        }

        // Get user-created courses from localStorage
        try {
          const storedCourses = localStorage.getItem('demo-courses')
          if (storedCourses) {
            const userCourses = JSON.parse(storedCourses)
            allCourses = [...allCourses, ...userCourses]
          }
        } catch (error) {
          console.error('Error loading user courses:', error)
        }

        const foundCourse = allCourses.find(c => c.id === courseId)
        if (!foundCourse) {
          router.push('/student/courses')
          return
        }
        setCourse(foundCourse)

        // Load lessons for this course
        const storedLessons = localStorage.getItem(`course-${courseId}-lessons`)
        if (storedLessons) {
          const courseLessons = JSON.parse(storedLessons)
          const foundLesson = courseLessons.find((l: Lesson) => l.id === lessonId)
          
          if (!foundLesson || !foundLesson.isPublished) {
            router.push(`/student/courses/${courseId}`)
            return
          }
          
          // Process lesson assignments
          const processedLesson = {
            ...foundLesson,
            assignments: foundLesson.assignments?.filter((a: any) => a.status === 'published').map((a: any) => ({
              ...a,
              maxPoints: a.maxPoints || 100,
              instructions: a.instructions || a.description
            })) || []
          }
          
          setLesson(processedLesson)
        } else {
          // If no stored lessons, redirect back
          router.push(`/student/courses/${courseId}`)
          return
        }

        // Load student submissions
        const storedSubmissions = localStorage.getItem('assignment-submissions')
        if (storedSubmissions) {
          const allSubmissions = JSON.parse(storedSubmissions)
          const studentSubmissions = allSubmissions.filter((s: any) => 
            s.courseId === courseId && s.studentId === 'current-student'
          ).map((s: any) => ({
            assignmentId: s.assignmentId,
            content: s.submissionText || '',
            fileName: s.fileName,
            submittedAt: s.submittedAt,
            status: s.status || 'submitted',
            grade: s.grade,
            feedback: s.feedback
          }))
          setSubmissions(studentSubmissions)
        }

      } catch (error) {
        console.error('Error fetching lesson data:', error)
        router.push(`/student/courses/${courseId}`)
      } finally {
        setLoading(false)
      }
    }

    fetchLessonData()
  }, [courseId, lessonId, router])

  const handleCompleteLesson = () => {
    if (!lesson) return

    const updatedLesson = {
      ...lesson,
      isCompleted: true,
      completedAt: new Date().toISOString()
    }
    setLesson(updatedLesson)

    // Update lesson progress in localStorage
    try {
      const storedLessons = localStorage.getItem(`course-${courseId}-lessons`)
      if (storedLessons) {
        const courseLessons = JSON.parse(storedLessons)
        const updatedLessons = courseLessons.map((l: Lesson) =>
          l.id === lessonId ? updatedLesson : l
        )
        localStorage.setItem(`course-${courseId}-lessons`, JSON.stringify(updatedLessons))
      }

      // Update student progress
      const enrollments = JSON.parse(localStorage.getItem('student-enrollments') || '[]')
      const updatedEnrollments = enrollments.map((e: any) => {
        if (e.courseId === courseId) {
          const completedLessons = (e.completedLessons || 0) + 1
          const totalLessons = e.totalLessons || 1
          return {
            ...e,
            completedLessons,
            progress: Math.round((completedLessons / totalLessons) * 100)
          }
        }
        return e
      })
      localStorage.setItem('student-enrollments', JSON.stringify(updatedEnrollments))
    } catch (error) {
      console.error('Error updating lesson progress:', error)
    }

    alert('Lesson completed! Great job!')
  }

  const handleSubmitAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setShowSubmissionModal(true)
    setSubmissionText('')
    setSubmissionFile(null)

    // Pre-fill if there's an existing submission
    const existingSubmission = submissions.find(s => s.assignmentId === assignment.id)
    if (existingSubmission) {
      setSubmissionText(existingSubmission.content)
    }
  }

  const handleAssignmentSubmission = () => {
    if (!selectedAssignment) return

    if (!submissionText.trim() && !submissionFile) {
      alert('Please provide either text submission or upload a file.')
      return
    }

    try {
      // Save submission to localStorage
      const assignmentSubmissions = JSON.parse(localStorage.getItem('assignment-submissions') || '[]')
      
      // Remove existing submission if any
      const filteredSubmissions = assignmentSubmissions.filter((s: any) => 
        !(s.assignmentId === selectedAssignment.id && s.studentId === 'current-student')
      )

      const newSubmission = {
        assignmentId: selectedAssignment.id,
        courseId: courseId,
        lessonId: lessonId,
        studentId: 'current-student',
        studentName: 'Current Student',
        submissionText: submissionText.trim(),
        fileName: submissionFile?.name || null,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      }

      filteredSubmissions.push(newSubmission)
      localStorage.setItem('assignment-submissions', JSON.stringify(filteredSubmissions))

      // Update local submissions state
      const updatedSubmissions = submissions.filter(s => s.assignmentId !== selectedAssignment.id)
      updatedSubmissions.push({
        assignmentId: selectedAssignment.id,
        content: submissionText.trim(),
        fileName: submissionFile?.name,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      })
      setSubmissions(updatedSubmissions)

    } catch (error) {
      console.error('Error saving assignment submission:', error)
      alert('Failed to submit assignment. Please try again.')
      return
    }

    setShowSubmissionModal(false)
    setSelectedAssignment(null)
    setSubmissionText('')
    setSubmissionFile(null)
    alert('Assignment submitted successfully!')
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setSubmissionFile(file)
    }
  }

  const getAssignmentStatus = (assignment: Assignment) => {
    const submission = submissions.find(s => s.assignmentId === assignment.id)
    if (!submission) return 'not_submitted'
    return submission.status === 'graded' ? 'graded' : 'submitted'
  }

  const getAssignmentSubmission = (assignment: Assignment) => {
    return submissions.find(s => s.assignmentId === assignment.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!course || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Not Found</h2>
          <button
            onClick={() => router.push(`/student/courses/${courseId}`)}
            className="text-blue-600 hover:text-blue-500"
          >
            ← Back to Course
          </button>
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
              <button
                onClick={() => router.push(`/student/courses/${courseId}`)}
                className="text-gray-500 hover:text-gray-700 mr-4 flex items-center"
              >
                {/*  - Lucide icon type issue with strict TypeScript */}
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Course
              </button>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-semibold text-gray-900">{lesson.title}</h1>
                  {course.code && (
                    <span className="text-sm text-gray-500 font-mono">({course.code})</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{course.title} • {course.instructor}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-gray-600">
                {/*  - Lucide icon type issue with strict TypeScript */}
                <Clock className="w-4 h-4 mr-1" />
                <span>{lesson.duration} minutes</span>
              </div>
              {lesson.isCompleted ? (
                <div className="flex items-center text-green-600 text-sm font-medium">
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span>Completed</span>
                </div>
              ) : (
                <button
                  onClick={handleCompleteLesson}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'content', label: 'Lesson Content', count: null },
              { key: 'materials', label: 'Materials', count: lesson.materials.length },
              { key: 'assignments', label: 'Assignments', count: lesson.assignments.filter(a => a.status === 'published').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} {tab.count !== null && `(${tab.count})`}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h2>
              <p className="text-gray-600 mb-4">{lesson.description}</p>
            </div>

            {/* Video Player Placeholder */}
            <div className="bg-gray-900 rounded-lg mb-6 aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                {/*  - Lucide icon type issue with strict TypeScript */}
                <Play className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">Video: {lesson.title}</p>
                <p className="text-sm opacity-75">Click to play lesson video</p>
              </div>
            </div>

            {/* Lesson Content */}
            <div className="prose max-w-none">
              <h3>Lesson Overview</h3>
              <div className="whitespace-pre-wrap">{lesson.content}</div>
              
              <h4>Learning Objectives</h4>
              <ul>
                <li>Understand the key concepts of {lesson.title.toLowerCase()}</li>
                <li>Apply practical techniques in real-world scenarios</li>
                <li>Demonstrate proficiency in the subject matter</li>
              </ul>
            </div>
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Learning Materials</h3>

            {lesson.materials.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                {/*  - Lucide icon type issue with strict TypeScript */}
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No materials available</h3>
                <p className="text-gray-600">Materials for this lesson will be added by your instructor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lesson.materials.map((material) => (
                  <div key={material.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="text-3xl">
                        {material.type === 'pdf' && '📄'}
                        {material.type === 'video' && '🎥'}
                        {material.type === 'document' && '📝'}
                        {material.type === 'link' && '🔗'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{material.name}</p>
                        {material.size && (
                          <p className="text-sm text-gray-500">{material.size}</p>
                        )}
                      </div>
                    </div>
                    <button className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2">
                      {material.type === 'link' ? (
                        <>
                          {/*  - Lucide icon type issue with strict TypeScript */}
                          <ArrowLeft className="w-4 h-4 rotate-45" />
                          <span>Open Link</span>
                        </>
                      ) : (
                        <>
                          {/*  - Lucide icon type issue with strict TypeScript */}
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>

            {lesson.assignments.filter(a => a.status === 'published').length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                {/*  - Lucide icon type issue with strict TypeScript */}
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments available</h3>
                <p className="text-gray-600">Assignments for this lesson will be published by your instructor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lesson.assignments.filter(a => a.status === 'published').map((assignment) => {
                  const status = getAssignmentStatus(assignment)
                  const submission = getAssignmentSubmission(assignment)
                  const isOverdue = new Date(assignment.dueDate) < new Date()

                  return (
                    <div key={assignment.id} className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h4>
                          <p className="text-gray-600 mb-3">{assignment.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div>
                              <span className="font-medium">Due Date:</span> {new Date(assignment.dueDate).toLocaleDateString()}
                              {isOverdue && status === 'not_submitted' && (
                                <span className="ml-2 text-red-600 font-medium">OVERDUE</span>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">Max Points:</span> {assignment.maxPoints || 100}
                            </div>
                          </div>

                          {assignment.instructions && (
                            <div className="mb-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Instructions:</h5>
                              <div className="bg-gray-50 p-3 rounded border">
                                <p className="text-sm text-gray-900 whitespace-pre-wrap">{assignment.instructions}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ml-4 ${
                          status === 'graded' ? 'bg-green-100 text-green-800' :
                          status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          isOverdue ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {status === 'graded' ? 'GRADED' :
                           status === 'submitted' ? 'SUBMITTED' :
                           isOverdue ? 'OVERDUE' : 'PENDING'}
                        </span>
                      </div>

                      {/* Submission Status */}
                      {submission && (
                        <div className="mb-4">
                          <div className="bg-blue-50 p-4 rounded border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-800">
                                Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                              </span>
                              {submission.status === 'graded' && submission.grade !== undefined && (
                                <span className="text-sm font-bold text-blue-800">
                                  Grade: {submission.grade}%
                                </span>
                              )}
                            </div>
                            {submission.feedback && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-blue-800 mb-1">Instructor Feedback:</p>
                                <p className="text-sm text-blue-700">{submission.feedback}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        {status === 'not_submitted' && !isOverdue && (
                          <button
                            onClick={() => handleSubmitAssignment(assignment)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Submit Assignment
                          </button>
                        )}
                        {status === 'not_submitted' && isOverdue && (
                          <button
                            onClick={() => handleSubmitAssignment(assignment)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Submit Late
                          </button>
                        )}
                        {status === 'submitted' && (
                          <button
                            onClick={() => handleSubmitAssignment(assignment)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Update Submission
                          </button>
                        )}
                        {status === 'graded' && (
                          <div className="flex items-center text-green-600 text-sm font-medium">
                            {/*  - Lucide icon type issue with strict TypeScript */}
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span>Assignment Graded</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assignment Submission Modal */}
      {showSubmissionModal && selectedAssignment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Submit Assignment: {selectedAssignment.title}
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">{selectedAssignment.description}</p>
              <p className="text-sm text-gray-500">
                Due: {new Date(selectedAssignment.dueDate).toLocaleDateString()} • Max Points: {selectedAssignment.maxPoints || 100}
              </p>
            </div>

            <div className="space-y-4">
              {/* Text Submission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Written Response
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your assignment response here..."
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {/*  - Lucide icon type issue with strict TypeScript */}
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 text-center">
                      Click to upload a file or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX, TXT, JPG, PNG (max 10MB)
                    </p>
                  </label>
                  {submissionFile && (
                    <div className="mt-3 p-2 bg-blue-50 rounded border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">
                          📎 {submissionFile.name}
                        </span>
                        <button
                          onClick={() => setSubmissionFile(null)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        {(submissionFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submission Guidelines */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Submission Guidelines:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Provide either a written response or upload a file (or both)</li>
                  <li>• Make sure your submission addresses all parts of the assignment</li>
                  <li>• Files must be less than 10MB in size</li>
                  <li>• You can update your submission until the due date</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAssignmentSubmission}
                disabled={!submissionText.trim() && !submissionFile}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium"
              >
                Submit Assignment
              </button>
              <button
                onClick={() => {
                  setShowSubmissionModal(false)
                  setSelectedAssignment(null)
                  setSubmissionText('')
                  setSubmissionFile(null)
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium"
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