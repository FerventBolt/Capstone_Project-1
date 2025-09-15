'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  title: string
  code: string
  enrolledStudents: number
  completionRate: number
  pendingSubmissions: number
  nextDeadline?: string
}

interface Student {
  id: string
  name: string
  email: string
  course: string
  progress: number
  lastActivity: string
  status: 'active' | 'at_risk' | 'excellent'
}


export default function StaffDashboard() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch real data from Supabase
    const fetchDashboardData = async () => {
      try {
        // Mock data for now
        setCourses([
          {
            id: '1',
            title: 'Restaurant Service Operations',
            code: 'RSO101',
            enrolledStudents: 28,
            completionRate: 75,
            pendingSubmissions: 5,
            nextDeadline: '2024-02-15'
          },
          {
            id: '2',
            title: 'Bar Operations and Beverage Service',
            code: 'BOB201',
            enrolledStudents: 22,
            completionRate: 68,
            pendingSubmissions: 8,
            nextDeadline: '2024-02-18'
          },
          {
            id: '3',
            title: 'Front Desk Operations',
            code: 'FDO101',
            enrolledStudents: 35,
            completionRate: 82,
            pendingSubmissions: 3,
            nextDeadline: '2024-02-20'
          }
        ])

        setStudents([
          {
            id: '1',
            name: 'Juan Dela Cruz',
            email: 'juan.delacruz@lpunetwork.edu.ph',
            course: 'Restaurant Service Operations',
            progress: 85,
            lastActivity: '2 hours ago',
            status: 'excellent'
          },
          {
            id: '2',
            name: 'Maria Santos',
            email: 'maria.santos@lpunetwork.edu.ph',
            course: 'Bar Operations',
            progress: 45,
            lastActivity: '1 day ago',
            status: 'at_risk'
          },
          {
            id: '3',
            name: 'Carlos Mendoza',
            email: 'carlos.mendoza@lpunetwork.edu.ph',
            course: 'Front Desk Operations',
            progress: 72,
            lastActivity: '4 hours ago',
            status: 'active'
          },
          {
            id: '4',
            name: 'Ana Rodriguez',
            email: 'ana.rodriguez@lpunetwork.edu.ph',
            course: 'Restaurant Service Operations',
            progress: 92,
            lastActivity: '1 hour ago',
            status: 'excellent'
          }
        ])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100'
      case 'active':
        return 'text-blue-600 bg-blue-100'
      case 'at_risk':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your courses and track student progress.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{courses.reduce((sum, course) => sum + course.enrolledStudents, 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Completion</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(courses.reduce((sum, course) => sum + course.completionRate, 0) / courses.length) || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{courses.reduce((sum, course) => sum + course.pendingSubmissions, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* My Courses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
              <button
                onClick={() => router.push('/staff/courses')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    <span className="text-sm text-gray-600">{course.code}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">{course.enrolledStudents}</span> students
                    </div>
                    <div>
                      <span className="font-medium">{course.completionRate}%</span> completion
                    </div>
                    <div>
                      <span className="font-medium">{course.pendingSubmissions}</span> pending
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      {course.nextDeadline && (
                        <p className="text-xs text-gray-500">Next deadline: {course.nextDeadline}</p>
                      )}
                    </div>
                    <button
                      onClick={() => router.push(`/staff/courses/${course.id}`)}
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Student Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Student Overview</h3>
              <button
                onClick={() => router.push('/staff/students')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.course}</p>
                      <p className="text-xs text-gray-500">Last active: {student.lastActivity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{student.progress}%</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                        {student.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-600 mt-1">Common tasks to help you manage your courses and students</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Course Button */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                 onClick={() => router.push('/staff/courses')}>
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Create New Course</h4>
              <p className="text-sm text-gray-600 mb-4">Set up a new course with lessons, assignments, and materials for your students.</p>
              <div className="inline-flex items-center text-blue-600 font-medium text-sm">
                <span>Get Started</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Create Reminder Button */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer"
                 onClick={() => router.push('/staff/reminders')}>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Send Student Reminder</h4>
              <p className="text-sm text-gray-600 mb-4">Create and send important reminders to your students about assignments, exams, or announcements.</p>
              <div className="inline-flex items-center text-green-600 font-medium text-sm">
                <span>Create Reminder</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Additional Quick Links */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/staff/grading')}
                className="flex items-center p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-yellow-600">✅</span>
                </div>
                <span className="font-medium">Grade Submissions</span>
              </button>
              
              <button
                onClick={() => router.push('/staff/students')}
                className="flex items-center p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-purple-600">👥</span>
                </div>
                <span className="font-medium">View Students</span>
              </button>
              
              <button
                onClick={() => router.push('/staff/courses/assignments')}
                className="flex items-center p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-indigo-600">📝</span>
                </div>
                <span className="font-medium">Assignments</span>
              </button>
              
              <button
                onClick={() => router.push('/staff/profile')}
                className="flex items-center p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-gray-600">⚙️</span>
                </div>
                <span className="font-medium">Profile Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}