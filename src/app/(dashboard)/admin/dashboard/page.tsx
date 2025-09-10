'use client'

import { useState, useEffect } from 'react'

interface DashboardStats {
  totalUsers: number
  totalCourses: number
  totalCertifications: number
  activeEnrollments: number
  pendingApplications: number
  upcomingExams: number
}

interface RecentActivity {
  id: string
  type: 'enrollment' | 'application' | 'completion' | 'exam'
  user: string
  description: string
  timestamp: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalCertifications: 0,
    activeEnrollments: 0,
    pendingApplications: 0,
    upcomingExams: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch real data from Supabase
    const fetchDashboardData = async () => {
      try {
        // Mock data for now
        setStats({
          totalUsers: 1247,
          totalCourses: 24,
          totalCertifications: 5,
          activeEnrollments: 892,
          pendingApplications: 23,
          upcomingExams: 3
        })

        setRecentActivity([
          {
            id: '1',
            type: 'enrollment',
            user: 'Maria Santos',
            description: 'enrolled in Restaurant Service Operations',
            timestamp: '2 hours ago'
          },
          {
            id: '2',
            type: 'application',
            user: 'Juan Dela Cruz',
            description: 'applied for Food & Beverages Services NC II',
            timestamp: '4 hours ago'
          },
          {
            id: '3',
            type: 'completion',
            user: 'Ana Rodriguez',
            description: 'completed Front Desk Operations course',
            timestamp: '6 hours ago'
          },
          {
            id: '4',
            type: 'exam',
            user: 'Carlos Mendoza',
            description: 'registered for TESDA NC II exam',
            timestamp: '1 day ago'
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return '📚'
      case 'application':
        return '📝'
      case 'completion':
        return '✅'
      case 'exam':
        return '🎓'
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">Welcome back! Here's what's happening in your platform.</p>
      </div>

      {/* Improved Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 transition-all hover:shadow-md min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600 ml-2 flex-shrink-0">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
              <span className="font-medium">12%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 transition-all hover:shadow-md min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{stats.totalCourses}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600 ml-2 flex-shrink-0">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
              <span className="font-medium">8%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 transition-all hover:shadow-md min-w-0">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Certifications</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{stats.totalCertifications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 transition-all hover:shadow-md min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Active Enrollments</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{stats.activeEnrollments.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600 ml-2 flex-shrink-0">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
              <span className="font-medium">5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 transition-all hover:shadow-md min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Applications</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{stats.pendingApplications}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-red-600 ml-2 flex-shrink-0">
              <svg className="w-4 h-4 mr-1 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
              <span className="font-medium">3%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 transition-all hover:shadow-md min-w-0">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-indigo-100 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Upcoming Exams</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{stats.upcomingExams}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span> {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  console.log('DEBUG: Invite Users button clicked')
                  window.location.href = '/admin/users/invitations'
                }}
                className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="text-sm font-medium text-gray-900">Invite Users</div>
                <div className="text-xs text-gray-500">Send invitations to new users</div>
              </button>
              
              
              <button
                onClick={() => {
                  console.log('DEBUG: Schedule Exam button clicked')
                  window.location.href = '/admin/certifications/exams'
                }}
                className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl mb-2">🎓</div>
                <div className="text-sm font-medium text-gray-900">Schedule Exam</div>
                <div className="text-xs text-gray-500">Schedule a new TESDA exam</div>
              </button>
              
              <button
                onClick={() => {
                  console.log('DEBUG: View Reports button clicked')
                  window.location.href = '/admin/reports'
                }}
                className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm font-medium text-gray-900">View Reports</div>
                <div className="text-xs text-gray-500">Generate system reports</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}