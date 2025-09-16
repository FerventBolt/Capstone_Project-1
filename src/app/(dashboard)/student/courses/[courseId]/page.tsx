'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, FileText, Clock, CheckCircle, AlertCircle, Users, Upload } from 'lucide-react'
import { initializeCourseContent, isCourseContentInitialized, markCourseContentInitialized } from '@/lib/initialize-course-content'

interface Course {
  id: string
  title: string
  code: string
  description: string
  category: 'Food & Beverages' | 'Front Office' | 'Housekeeping' | 'Tourism' | 'Cookery'
  level: 'NC I' | 'NC II' | 'NC III'
  duration: number
  instructor: string
  enrolledStudents: number
  maxStudents: number
  totalLessons: number
  completedLessons: number
  completionRate: number
  pendingSubmissions: number
  status: 'active' | 'inactive' | 'draft'
  coursePassword?: string
  allowSelfEnrollment: boolean
  createdAt: string
  updatedAt: string
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
  submissions: number
  maxPoints: number
}

interface StudentEnrollment {
  id: string
  courseId: string
  studentId: string
  enrollmentDate: string
  progress: number
  status: 'enrolled' | 'completed' | 'dropped'
  finalGrade?: number
  completionDate?: string
  lessonsCompleted: number
  totalLessons: number
  nextLesson?: string
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

export default function StudentCourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [enrollment, setEnrollment] = useState<StudentEnrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'assignments' | 'progress'>('overview')
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissionText, setSubmissionText] = useState('')
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Initialize course content if not already done
        if (!isCourseContentInitialized()) {
          initializeCourseContent()
          markCourseContentInitialized()
          console.log('🔍 DEBUG: Course content initialized')
        }
        
        // Get courses from API and localStorage
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

        // Check enrollment
        const enrollments = JSON.parse(localStorage.getItem('student-enrollments') || '[]')
        const studentEnrollment = enrollments.find((e: StudentEnrollment) => e.courseId === courseId)
        
        if (!studentEnrollment || studentEnrollment.status === 'dropped') {
          router.push('/student/courses')
          return
        }
        setEnrollment(studentEnrollment)

        // Load lessons for this course
        try {
          const storedLessons = localStorage.getItem(`course-${courseId}-lessons`)
          if (storedLessons) {
            const courseLessons = JSON.parse(storedLessons)
            setLessons(courseLessons)
          }
        } catch (error) {
          console.error('Error loading course lessons:', error)
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
        console.error('Error fetching course data:', error)
        router.push('/student/courses')
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId, router])

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

  if (!course || !enrollment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <button 
            onClick={() => router.push('/student/courses')}
            className="text-blue-600 hover:text-blue-500"
          >
            ← Back to Courses
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Same as Staff */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/student/courses')}
                className="text-gray-500 hover:text-gray-700 mr-4 flex items-center"
              >
                {/*  - Lucide icon type issue with strict TypeScript */}
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Courses
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{course.title}</h1>
                <p className="text-sm text-gray-500">{course.code} • {course.instructor}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                course.status === 'active' ? 'bg-green-100 text-green-800' :
                course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {course.status.toUpperCase()}
              </span>
              <div className="text-sm text-gray-600">
                Progress: {enrollment.progress}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Same as Staff */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: BookOpen },
              { key: 'content', label: 'Content', icon: FileText },
              { key: 'assignments', label: 'Assignments', icon: CheckCircle },
              { key: 'progress', label: 'My Progress', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab - Same as Staff */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">My Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{enrollment.progress}%</p>
                  </div>
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{enrollment.lessonsCompleted}/{enrollment.totalLessons}</p>
                  </div>
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Assignments Submitted</p>
                    <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
                  </div>
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Course Duration</p>
                    <p className="text-2xl font-bold text-gray-900">{course.duration}h</p>
                  </div>
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Course Information - Same as Staff */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-900">{course.description}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Category:</span>
                    <span className="ml-2 text-gray-900">{course.category}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Level:</span>
                    <span className="ml-2 text-gray-900">{course.level}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Duration:</span>
                    <span className="ml-2 text-gray-900">{course.duration} hours</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Instructor:</span>
                    <span className="ml-2 text-gray-900">{course.instructor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Tab - Same as Staff but Read-Only */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
              <span className="text-sm text-gray-500">{lessons.length} lessons available</span>
            </div>

            {lessons.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                {/*  - Lucide icon type issue with strict TypeScript */}
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content available</h3>
                <p className="text-gray-600">Course content will be added by your instructor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <div key={lesson.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            Lesson {index + 1}
                          </span>
                          <h4 className="text-lg font-semibold text-gray-900">{lesson.title}</h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            lesson.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {lesson.isPublished ? 'Available' : 'Coming Soon'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{lesson.description}</p>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            {/*  - Lucide icon type issue with strict TypeScript */}
                            <Clock className="w-4 h-4" />
                            <span>{lesson.duration} minutes</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/*  - Lucide icon type issue with strict TypeScript */}
                            <FileText className="w-4 h-4" />
                            <span>{lesson.materials.length} materials</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/*  - Lucide icon type issue with strict TypeScript */}
                            <CheckCircle className="w-4 h-4" />
                            <span>{lesson.assignments.length} assignments</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {lesson.isPublished && (
                          <button
                            onClick={() => router.push(`/student/courses/${courseId}/content/${lesson.id}`)}
                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-500 border border-blue-200 rounded"
                          >
                            View Lesson
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Course Assignments</h3>

            <div className="space-y-4">
              {lessons.flatMap(lesson => 
                lesson.assignments.filter(a => a.status === 'published').map(assignment => {
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
                              {isOverdue && !submission && (
                                <span className="ml-2 text-red-600 font-medium">OVERDUE</span>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">Max Points:</span> {assignment.maxPoints}
                            </div>
                          </div>
                        </div>
                        
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ml-4 ${
                          submission?.status === 'graded' ? 'bg-green-100 text-green-800' :
                          submission ? 'bg-blue-100 text-blue-800' :
                          isOverdue ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {submission?.status === 'graded' ? 'GRADED' :
                           submission ? 'SUBMITTED' :
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
                        {!submission && !isOverdue && (
                          <button
                            onClick={() => handleSubmitAssignment(assignment)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Submit Assignment
                          </button>
                        )}
                        {!submission && isOverdue && (
                          <button
                            onClick={() => handleSubmitAssignment(assignment)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Submit Late
                          </button>
                        )}
                        {submission && submission.status === 'submitted' && (
                          <button
                            onClick={() => handleSubmitAssignment(assignment)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Update Submission
                          </button>
                        )}
                        {submission?.status === 'graded' && (
                          <div className="flex items-center text-green-600 text-sm font-medium">
                            {/*  - Lucide icon type issue with strict TypeScript */}
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span>Assignment Graded</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}

              {lessons.flatMap(l => l.assignments.filter(a => a.status === 'published')).length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments available</h3>
                  <p className="text-gray-600">Assignments will be published by your instructor.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">My Learning Progress</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{enrollment.progress}%</div>
                <div className="text-sm text-gray-600">Overall Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{enrollment.lessonsCompleted}</div>
                <div className="text-sm text-gray-600">Lessons Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{submissions.filter(s => s.status === 'graded').length}</div>
                <div className="text-sm text-gray-600">Assignments Graded</div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Lesson Progress</h4>
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{lesson.title}</p>
                      <p className="text-sm text-gray-500">{lesson.duration} minutes</p>
                    </div>
                    <div className="flex items-center">
                      {lesson.isPublished ? (
                        <span className="text-sm text-blue-600">Available</span>
                      ) : (
                        <span className="text-sm text-gray-500">Coming Soon</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Assignment Grades</h4>
              <div className="space-y-3">
                {lessons.flatMap(lesson => 
                  lesson.assignments.filter(a => a.status === 'published').map(assignment => {
                    const submission = getAssignmentSubmission(assignment)
                    return (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{assignment.title}</p>
                          <p className="text-sm text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          {submission?.grade ? (
                            <div className="text-lg font-semibold text-green-600">{submission.grade}%</div>
                          ) : submission ? (
                            <span className="text-sm text-blue-600">Submitted</span>
                          ) : (
                            <span className="text-sm text-gray-500">Not submitted</span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
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
                Due: {new Date(selectedAssignment.dueDate).toLocaleDateString()} • Max Points: {selectedAssignment.maxPoints}
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