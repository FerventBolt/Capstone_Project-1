'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Users, BookOpen, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/supabase-client'

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
  const [analytics, setAnalytics] = useState({
    totalEnrollments: 0,
    activeStudents: 0,
    completedStudents: 0,
    droppedStudents: 0,
    averageProgress: 0,
    totalSubmissions: 0,
    gradedSubmissions: 0,
    pendingSubmissions: 0,
    averageGrade: 0,
    passRate: 0
  })

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Fetch course from Supabase
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single()

        if (courseError || !courseData) {
          console.error('Error fetching course:', courseError)
          router.push('/admin/courses')
          return
        }

        // Count enrollments
        const { count: totalEnrollments } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', courseId)

        const { count: activeCount } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', courseId)
          .in('status', ['enrolled', 'in_progress'])

        const { count: completedCount } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', courseId)
          .eq('status', 'completed')

        const { count: droppedCount } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', courseId)
          .eq('status', 'dropped')

        // Map database fields to component interface
        const mappedCourse: Course = {
          id: courseData.id,
          title: courseData.title,
          code: courseData.code || '',
          description: courseData.description || '',
          category: courseData.category as any,
          level: courseData.level as any,
          duration: courseData.duration || 0,
          instructor: courseData.instructor || '',
          enrolledStudents: totalEnrollments || 0,
          maxStudents: 0,
          totalLessons: 0,
          completedLessons: 0,
          completionRate: totalEnrollments ? Math.round(((completedCount || 0) / totalEnrollments) * 100) : 0,
          pendingSubmissions: 0,
          status: 'active',
          allowSelfEnrollment: true,
          createdAt: courseData.created_at,
          updatedAt: courseData.updated_at || courseData.created_at
        }

        setCourse(mappedCourse)

        // Fetch lessons from Supabase
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('created_at', { ascending: true })

        if (!lessonsError && lessonsData) {
          // Fetch assignments for this course to show in lessons
          const { data: assignmentsData } = await supabase
            .from('assignments')
            .select('*')
            .eq('course_id', courseId)

          // Fetch materials for all lessons
          const lessonIds = lessonsData.map((l: any) => l.id)
          const { data: materialsData } = await supabase
            .from('materials')
            .select('*')
            .in('lesson_id', lessonIds)

          setLessons(lessonsData.map((lesson: any, index: number) => ({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description || '',
            content: lesson.content || '',
            duration: lesson.duration || 0,
            materials: (materialsData || [])
              .filter((m: any) => m.lesson_id === lesson.id)
              .map((m: any) => ({
                id: m.id,
                name: m.name,
                type: m.type,
                url: m.url,
                size: m.size
              })),
            assignments: (assignmentsData || []).map((a: any) => ({
              id: a.id,
              title: a.title,
              description: a.description || '',
              dueDate: a.due_date,
              status: 'published',
              submissions: 0,
              maxPoints: 100
            })),
            order: index + 1,
            isPublished: false
          })))
        }

        // Fetch analytics data
        setAnalytics({
          totalEnrollments: totalEnrollments || 0,
          activeStudents: activeCount || 0,
          completedStudents: completedCount || 0,
          droppedStudents: droppedCount || 0,
          averageProgress: 0, // TODO: Calculate from progress tracking
          totalSubmissions: 0, // TODO: Count from submissions
          gradedSubmissions: 0,
          pendingSubmissions: 0,
          averageGrade: 0,
          passRate: 0
        })

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

  const handleDeleteLesson = async (lessonId: string, lessonTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${lessonTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId)

      if (error) {
        alert('Error deleting lesson: ' + error.message)
        return
      }

      alert('Lesson deleted successfully!')
      // Reload the page to refresh the lessons list
      window.location.reload()
    } catch (error) {
      console.error('Error deleting lesson:', error)
      alert('Failed to delete lesson. Please try again.')
    }
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
                {/*  - Lucide icon type issue with strict TypeScript */}
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
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                    <p className="text-2xl font-bold text-gray-900">{lessons.length}</p>
                  </div>
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Submissions</p>
                    <p className="text-2xl font-bold text-gray-900">{course.pendingSubmissions}</p>
                  </div>
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{course.completionRate}%</p>
                  </div>
                  {/*  - Lucide icon type issue with strict TypeScript */}
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
                {/*  - Lucide icon type issue with strict TypeScript */}
                <Plus className="w-4 h-4" />
                <span>Add New Content</span>
              </button>
            </div>

            {lessons.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                {/*  - Lucide icon type issue with strict TypeScript */}
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
                          onClick={() => router.push(`/admin/courses/${courseId}/content/${lesson.id}`)}
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-500 border border-blue-200 rounded"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded"
                          title="Delete Lesson"
                        >
                          Delete
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
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Students</p>
                    <p className="text-2xl font-bold text-gray-900">{course.enrolledStudents}</p>
                  </div>
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{course.completionRate}%</p>
                  </div>
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <AlertCircle className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Course Analytics</h3>
            
            {/* Enrollment Analytics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Statistics</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{analytics.totalEnrollments}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Enrollments</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{analytics.activeStudents}</p>
                  <p className="text-sm text-gray-600 mt-1">Active Students</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">{analytics.completedStudents}</p>
                  <p className="text-sm text-gray-600 mt-1">Completed</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-3xl font-bold text-red-600">{analytics.droppedStudents}</p>
                  <p className="text-sm text-gray-600 mt-1">Dropped</p>
                </div>
              </div>
            </div>

            {/* Content Analytics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Content Statistics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <p className="text-3xl font-bold text-indigo-600">{lessons.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Lessons</p>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <p className="text-3xl font-bold text-teal-600">
                    {lessons.reduce((sum, lesson) => sum + lesson.duration, 0)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Total Minutes</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-3xl font-bold text-orange-600">
                    {lessons.reduce((sum, lesson) => sum + lesson.assignments.length, 0)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Total Assignments</p>
                </div>
              </div>
            </div>

            {/* Performance Analytics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                    <span className="text-sm font-bold text-gray-900">{course.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${course.completionRate}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Enrollment Capacity</span>
                    <span className="text-sm font-bold text-gray-900">
                      {analytics.totalEnrollments}/{course.maxStudents || 'Unlimited'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{
                        width: course.maxStudents
                          ? `${Math.min((analytics.totalEnrollments / course.maxStudents) * 100, 100)}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Analytics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Student Engagement</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Average Progress</p>
                    <p className="text-xs text-gray-500">Across all enrolled students</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{analytics.averageProgress}%</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Active Participation</p>
                    <p className="text-xs text-gray-500">Students actively engaged</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalEnrollments > 0
                      ? Math.round((analytics.activeStudents / analytics.totalEnrollments) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Retention Rate</p>
                    <p className="text-xs text-gray-500">Students who haven't dropped</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalEnrollments > 0
                      ? Math.round(((analytics.totalEnrollments - analytics.droppedStudents) / analytics.totalEnrollments) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Assignment Analytics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Assignment Statistics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalSubmissions}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Submissions</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{analytics.gradedSubmissions}</p>
                  <p className="text-sm text-gray-600 mt-1">Graded</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-3xl font-bold text-yellow-600">{analytics.pendingSubmissions}</p>
                  <p className="text-sm text-gray-600 mt-1">Pending Review</p>
                </div>
              </div>
              {analytics.totalSubmissions > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Average Grade</p>
                      <p className="text-3xl font-bold text-blue-600">{analytics.averageGrade}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Pass Rate</p>
                      <p className="text-3xl font-bold text-green-600">{analytics.passRate}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Time-based Analytics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Course Created</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Total Duration</span>
                  <span className="text-sm font-medium text-gray-900">{course.duration} hours</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}