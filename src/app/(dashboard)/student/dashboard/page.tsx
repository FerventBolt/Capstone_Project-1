'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { initializeCourseContent, isCourseContentInitialized, markCourseContentInitialized } from '@/lib/initialize-course-content'
import ReminderPopupDemo from '@/components/shared/reminder-popup-demo'

interface Course {
  id: string
  title: string
  code: string
  description: string
  category: 'Food & Beverages' | 'Front Office' | 'Housekeeping' | 'Tourism' | 'Cookery'
  level: 'NC I' | 'NC II' | 'NC III'
  duration: number // in hours
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

interface Assignment {
  id: string
  courseId: string
  title: string
  description: string
  dueDate: string
  type: 'essay' | 'project' | 'quiz' | 'practical'
  maxPoints: number
  status: 'pending' | 'submitted' | 'graded'
  submittedAt?: string
  grade?: number
  feedback?: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  timestamp: string
  isRead: boolean
  courseId?: string
}

export default function StudentDashboard() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('🔍 DEBUG: Fetching dashboard data...')
        
        // Initialize course content if not already done
        if (!isCourseContentInitialized()) {
          initializeCourseContent()
          markCourseContentInitialized()
          console.log('🔍 DEBUG: Course content initialized')
        }
        
        // Get courses from the same source as the courses page
        let allCourses: Course[] = []
        try {
          // Get default courses from API
          const response = await fetch('/api/admin/courses', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
  
          let defaultCourses = []
          if (response.ok) {
            const result = await response.json()
            defaultCourses = result.courses || []
            console.log('🔍 DEBUG: Successfully fetched default courses:', defaultCourses.length)
          }
          
          // Get user-created courses from localStorage (same as staff)
          let userCreatedCourses = []
          try {
            const storedCourses = localStorage.getItem('demo-courses')
            if (storedCourses) {
              userCreatedCourses = JSON.parse(storedCourses)
              console.log('🔍 DEBUG: Found user-created courses in localStorage:', userCreatedCourses.length)
            }
          } catch (storageError) {
            console.error('🔍 DEBUG: Error reading courses from localStorage:', storageError)
          }
          
          // Merge courses and ensure all fields are present
          allCourses = [...defaultCourses, ...userCreatedCourses].map(course => ({
            ...course,
            code: course.code || `${course.category?.substring(0,3).toUpperCase()}${Math.floor(Math.random() * 900) + 100}`,
            totalLessons: course.totalLessons || 0,
            completedLessons: course.completedLessons || 0,
            completionRate: course.completionRate || 0,
            pendingSubmissions: course.pendingSubmissions || 0,
            coursePassword: course.coursePassword || '',
            allowSelfEnrollment: course.allowSelfEnrollment ?? true
          }))
          console.log('🔍 DEBUG: Total courses available:', allCourses.length)
        } catch (error) {
          console.error('🔍 DEBUG: Error fetching courses:', error)
        }

        // Filter only active courses for students
        const activeCourses = allCourses.filter(course => course.status === 'active')
        setCourses(activeCourses)

        // Get student enrollments from localStorage
        let studentEnrollments = []
        try {
          const storedEnrollments = localStorage.getItem('student-enrollments')
          if (storedEnrollments) {
            studentEnrollments = JSON.parse(storedEnrollments)
            console.log('🔍 DEBUG: Found student enrollments in localStorage:', studentEnrollments.length)
          }
        } catch (storageError) {
          console.error('🔍 DEBUG: Error reading enrollments from localStorage:', storageError)
        }

        // Add default enrollments if none exist
        if (studentEnrollments.length === 0) {
          studentEnrollments = [
            {
              id: '1',
              courseId: '1', // Restaurant Service Operations NC II
              studentId: 'current-student',
              enrollmentDate: '2024-01-15',
              progress: 85,
              status: 'enrolled',
              lessonsCompleted: 10,
              totalLessons: 12,
              nextLesson: 'Wine Service and Pairing'
            },
            {
              id: '2',
              courseId: '2', // Front Desk Operations NC II
              studentId: 'current-student',
              enrollmentDate: '2023-10-01',
              progress: 100,
              status: 'completed',
              finalGrade: 92,
              completionDate: '2023-12-15',
              lessonsCompleted: 10,
              totalLessons: 10
            }
          ]
          console.log('🔍 DEBUG: Added default student enrollments')
          localStorage.setItem('student-enrollments', JSON.stringify(studentEnrollments))
        }

        setEnrollments(studentEnrollments)

        // Get assignments from localStorage
        let studentAssignments = []
        try {
          const storedAssignments = localStorage.getItem('student-assignments')
          if (storedAssignments) {
            studentAssignments = JSON.parse(storedAssignments)
          }
        } catch (error) {
          console.error('Error reading assignments from localStorage:', error)
        }

        // Add default assignments if none exist
        if (studentAssignments.length === 0) {
          studentAssignments = [
            {
              id: '1',
              courseId: '1',
              title: 'Customer Service Excellence Report',
              description: 'Write a comprehensive report on customer service best practices in restaurant operations.',
              dueDate: '2024-02-15',
              type: 'essay',
              maxPoints: 100,
              status: 'pending'
            },
            {
              id: '2',
              courseId: '1',
              title: 'Table Setting Practical Assessment',
              description: 'Demonstrate proper table setting techniques for fine dining service.',
              dueDate: '2024-02-20',
              type: 'practical',
              maxPoints: 50,
              status: 'submitted',
              submittedAt: '2024-02-18',
              grade: 45,
              feedback: 'Excellent technique! Minor improvement needed in napkin folding.'
            }
          ]
          localStorage.setItem('student-assignments', JSON.stringify(studentAssignments))
        }

        setAssignments(studentAssignments)

        // Generate notifications based on real data
        const generatedNotifications: Notification[] = []
        
        // Add notifications for pending assignments
        const pendingAssignments = studentAssignments.filter((a: Assignment) => a.status === 'pending')
        pendingAssignments.forEach((assignment: Assignment) => {
          const course = activeCourses.find(c => c.id === assignment.courseId)
          if (course) {
            generatedNotifications.push({
              id: `assignment-${assignment.id}`,
              title: 'Assignment Due Soon',
              message: `"${assignment.title}" is due on ${new Date(assignment.dueDate).toLocaleDateString()} for ${course.title}.`,
              type: 'warning',
              timestamp: '1 day ago',
              isRead: false,
              courseId: course.id
            })
          }
        })

        // Add notifications for completed courses
        const completedEnrollments = studentEnrollments.filter((e: StudentEnrollment) => e.status === 'completed')
        completedEnrollments.forEach((enrollment: StudentEnrollment) => {
          const course = activeCourses.find(c => c.id === enrollment.courseId)
          if (course) {
            generatedNotifications.push({
              id: `completion-${enrollment.id}`,
              title: 'Course Completed',
              message: `Congratulations! You have completed "${course.title}" with a grade of ${enrollment.finalGrade}%.`,
              type: 'success',
              timestamp: '3 days ago',
              isRead: true,
              courseId: course.id
            })
          }
        })

        // Add notifications for graded assignments
        const gradedAssignments = studentAssignments.filter((a: Assignment) => a.status === 'graded' && a.grade !== undefined)
        gradedAssignments.forEach((assignment: Assignment) => {
          const course = activeCourses.find(c => c.id === assignment.courseId)
          if (course) {
            generatedNotifications.push({
              id: `grade-${assignment.id}`,
              title: 'Assignment Graded',
              message: `Your assignment "${assignment.title}" has been graded. Score: ${assignment.grade}/${assignment.maxPoints}`,
              type: 'info',
              timestamp: '2 hours ago',
              isRead: false,
              courseId: course.id
            })
          }
        })

        // Add general notifications
        generatedNotifications.push({
          id: 'welcome',
          title: 'Welcome to CTE Learning Platform',
          message: 'Explore your courses and start your learning journey today!',
          type: 'info',
          timestamp: '1 week ago',
          isRead: true
        })

        setNotifications(generatedNotifications)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getEnrollmentForCourse = (courseId: string) => {
    return enrollments.find(enrollment => enrollment.courseId === courseId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'enrolled':
      case 'in_progress':
        return 'text-blue-600 bg-blue-100'
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'not_started':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'dropped':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Food & Beverages':
        return 'bg-blue-100 text-blue-800'
      case 'Front Office':
        return 'bg-purple-100 text-purple-800'
      case 'Housekeeping':
        return 'bg-green-100 text-green-800'
      case 'Tourism':
        return 'bg-orange-100 text-orange-800'
      case 'Cookery':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return '📘'
      case 'warning':
        return '⚠️'
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '📋'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const enrolledCourses = enrollments.filter(e => e.status === 'enrolled')
  const completedCourses = enrollments.filter(e => e.status === 'completed')
  const pendingAssignments = assignments.filter(a => a.status === 'pending')
  const averageProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0

  return (
    <>
      {/* Reminder Popup */}
      <ReminderPopupDemo userId="current-student" />
      
      <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, Juan!</h1>
        <p className="text-gray-600 mt-2">Continue your learning journey and track your progress.</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Courses</p>
              <p className="text-2xl font-bold text-gray-900">{completedCourses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{pendingAssignments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Progress</p>
              <p className="text-2xl font-bold text-gray-900">{averageProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Courses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
              <button
                onClick={() => router.push('/student/courses')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {enrollments.filter(e => e.status !== 'dropped').slice(0, 3).map((enrollment) => {
                const course = courses.find(c => c.id === enrollment.courseId)
                if (!course) return null

                return (
                  <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{course.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm text-gray-600 font-mono">{course.code}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(course.category)}`}>
                        {course.category}
                      </span>
                    </div>
                    
                    {enrollment.status !== 'completed' && (
                      <>
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm text-gray-600 mb-3">
                          <span>Lessons:</span>
                          <span>{enrollment.lessonsCompleted}/{enrollment.totalLessons}</span>
                        </div>
                        
                        {enrollment.nextLesson && (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Next: {enrollment.nextLesson}</p>
                            </div>
                            <button
                              onClick={() => router.push(`/student/courses/${course.id}`)}
                              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                            >
                              Continue
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {enrollment.status === 'completed' && enrollment.finalGrade && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium">✓ Completed</p>
                          <p className="text-sm text-gray-600">Final Grade: {enrollment.finalGrade}%</p>
                        </div>
                        <button
                          onClick={() => router.push(`/student/courses/${course.id}`)}
                          className="text-sm text-green-600 hover:text-green-500 font-medium"
                        >
                          View Certificate
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
              
              {enrollments.filter(e => e.status !== 'dropped').length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-gray-600 mb-4">No courses enrolled yet</p>
                  <button
                    onClick={() => router.push('/student/courses')}
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Assignments</h3>
              <button
                onClick={() => router.push('/student/assignments')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {assignments.slice(0, 3).map((assignment) => {
                const course = courses.find(c => c.id === assignment.courseId)
                if (!course) return null

                return (
                  <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {assignment.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{course.title}</p>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      <span>{assignment.maxPoints} points</span>
                    </div>
                    {assignment.grade !== undefined && (
                      <div className="text-sm">
                        <span className="text-gray-600">Grade:</span>
                        <span className="ml-2 font-medium text-green-600">{assignment.grade}/{assignment.maxPoints}</span>
                      </div>
                    )}
                    {assignment.status === 'pending' && (
                      <div className="mt-3">
                        <button
                          onClick={() => router.push(`/student/courses/${course.id}`)}
                          className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                        >
                          Submit Assignment
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
              
              {assignments.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-gray-600">No assignments yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {notifications.slice(0, 4).map((notification) => (
              <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                notification.isRead ? 'bg-gray-50' : 'bg-blue-50'
              }`}>
                <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
          {notifications.length > 4 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => router.push('/student/notifications')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}