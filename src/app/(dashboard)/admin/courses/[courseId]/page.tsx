'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Users, BookOpen, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'

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

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'students' | 'analytics'>('overview')

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
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
          router.push('/admin/courses')
          return
        }

        setCourse(foundCourse)

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

      } catch (error) {
        console.error('Error fetching course data:', error)
        router.push('/admin/courses')
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId, router])

  const handleCreateContent = () => {
    router.push(`/admin/courses/${courseId}/content/new`)
  }

  const handleEditContent = (lessonId: string) => {
    router.push(`/admin/courses/${courseId}/content/${lessonId}`)
  }

  const handleViewSubmissions = (assignmentId: string) => {
    router.push(`/admin/courses/${courseId}/assignments/${assignmentId}/submissions`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <Link href="/admin/courses" className="text-blue-600 hover:text-blue-500">
            ← Back to Courses
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
                href="/admin/courses"
                className="text-gray-500 hover:text-gray-700 mr-4 flex items-center"
              >
                {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Courses
              </Link>
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
              <button
                onClick={handleCreateContent}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
              >
                {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                <Plus className="w-4 h-4" />
                <span>Add Content</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: BookOpen },
              { key: 'content', label: 'Content', icon: FileText },
              { key: 'students', label: 'Students', icon: Users },
              { key: 'analytics', label: 'Analytics', icon: CheckCircle }
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
                  {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Enrolled Students</p>
                    <p className="text-2xl font-bold text-gray-900">{course.enrolledStudents}</p>
                  </div>
                  {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                    <p className="text-2xl font-bold text-gray-900">{lessons.length}</p>
                  </div>
                  {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Submissions</p>
                    <p className="text-2xl font-bold text-gray-900">{course.pendingSubmissions}</p>
                  </div>
                  {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{course.completionRate}%</p>
                  </div>
                  {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Course Information */}
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
                    <span className="text-sm font-medium text-gray-700">Max Students:</span>
                    <span className="ml-2 text-gray-900">{course.maxStudents}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
              <button
                onClick={handleCreateContent}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
              >
                {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                <Plus className="w-4 h-4" />
                <span>Add New Content</span>
              </button>
            </div>

            {lessons.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
                <p className="text-gray-600 mb-4">Start building your course by adding lessons and materials.</p>
                <button
                  onClick={handleCreateContent}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Create First Lesson
                </button>
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
                            {lesson.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{lesson.description}</p>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                            <Clock className="w-4 h-4" />
                            <span>{lesson.duration} minutes</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                            <FileText className="w-4 h-4" />
                            <span>{lesson.materials.length} materials</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                            <CheckCircle className="w-4 h-4" />
                            <span>{lesson.assignments.length} assignments</span>
                          </div>
                        </div>

                        {lesson.assignments.length > 0 && (
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Assignments:</h5>
                            <div className="space-y-2">
                              {lesson.assignments.map((assignment) => (
                                <div key={assignment.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                  <div>
                                    <p className="font-medium text-gray-900">{assignment.title}</p>
                                    <p className="text-sm text-gray-600">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-600">{assignment.submissions} submissions</span>
                                    <button
                                      onClick={() => handleViewSubmissions(assignment.id)}
                                      className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                                    >
                                      View Submissions
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEditContent(lesson.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit Content"
                        >
                          {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/courses/${courseId}/content/${lesson.id}`)}
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-500 border border-blue-200 rounded"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Enrolled Students</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {course.enrolledStudents} of {course.maxStudents} students enrolled
                  </span>
                  <button
                    onClick={() => {
                      // Navigate to student management
                      router.push(`/admin/courses/${courseId}/students`)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Manage Enrollments
                  </button>
                </div>
              </div>

              {/* Student List */}
              <div className="space-y-4">
                {/* Demo enrolled students */}
                {[
                  { id: '1', name: 'John Doe', email: 'john.doe@email.com', studentId: 'STU001', enrolledAt: '2024-01-15', progress: 75, status: 'active' },
                  { id: '2', name: 'Jane Smith', email: 'jane.smith@email.com', studentId: 'STU002', enrolledAt: '2024-01-16', progress: 60, status: 'active' },
                  { id: '3', name: 'Mike Johnson', email: 'mike.johnson@email.com', studentId: 'STU003', enrolledAt: '2024-01-17', progress: 90, status: 'active' }
                ].slice(0, course.enrolledStudents).map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        <p className="text-xs text-gray-500">ID: {student.studentId} • Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{student.progress}% Complete</p>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.status.toUpperCase()}
                      </span>
                      <button
                        onClick={() => router.push(`/admin/users/${student.id}`)}
                        className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}

                {course.enrolledStudents === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">👥</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No students enrolled</h3>
                    <p className="text-gray-500 mb-4">Students will appear here once they enroll in the course.</p>
                    <button
                      onClick={() => router.push(`/admin/courses/${courseId}/students`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Add Students
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Progress</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {course.enrolledStudents > 0 ? Math.round((75 + 60 + 90) / 3) : 0}%
                    </p>
                  </div>
                  {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Students</p>
                    <p className="text-2xl font-bold text-gray-900">{course.enrolledStudents}</p>
                  </div>
                  {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{course.completionRate}%</p>
                  </div>
                  {/* @ts-expect-error - Lucide icon type issue with strict TypeScript */}
                  <AlertCircle className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Analytics</h3>
            <p className="text-gray-600">Analytics and reporting interface will be implemented here.</p>
          </div>
        )}
      </div>
    </div>
  )
}