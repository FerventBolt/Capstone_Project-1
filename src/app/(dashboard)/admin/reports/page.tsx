'use client'

import { useState, useEffect } from 'react'

interface ReportData {
  totalUsers: number
  totalCourses: number
  totalCertifications: number
  activeEnrollments: number
  completedCourses: number
  pendingApplications: number
  monthlyEnrollments: { month: string; count: number }[]
  certificationsByType: { type: string; count: number }[]
  usersByRole: { role: string; count: number }[]
  courseCompletionRates: { course: string; rate: number }[]
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<string>('overview')
  const [dateRange, setDateRange] = useState({
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  })

  useEffect(() => {
    // TODO: Fetch real data from Supabase
    const fetchReportData = async () => {
      try {
        // Mock data for now
        setReportData({
          totalUsers: 1247,
          totalCourses: 24,
          totalCertifications: 156,
          activeEnrollments: 892,
          completedCourses: 234,
          pendingApplications: 23,
          monthlyEnrollments: [
            { month: 'Jan', count: 45 },
            { month: 'Feb', count: 52 },
            { month: 'Mar', count: 38 },
            { month: 'Apr', count: 61 },
            { month: 'May', count: 49 },
            { month: 'Jun', count: 73 }
          ],
          certificationsByType: [
            { type: 'Food & Beverages NC II', count: 45 },
            { type: 'Front Office NC II', count: 38 },
            { type: 'Housekeeping NC II', count: 42 },
            { type: 'Tourism NC III', count: 18 },
            { type: 'Commercial Cooking NC II', count: 13 }
          ],
          usersByRole: [
            { role: 'Student', count: 1200 },
            { role: 'Staff', count: 45 },
            { role: 'Admin', count: 2 }
          ],
          courseCompletionRates: [
            { course: 'Restaurant Service Operations NC II', rate: 85 },
            { course: 'Front Desk Operations NC II', rate: 78 },
            { course: 'Housekeeping Services NC II', rate: 92 },
            { course: 'Commercial Cooking NC II', rate: 73 },
            { course: 'Tourism Promotion Services NC III', rate: 68 }
          ]
        })
      } catch (error) {
        console.error('Error fetching report data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [dateRange])

  const generateReport = async (reportType: string) => {
    try {
      // TODO: Implement report generation
      console.log('Generating report:', reportType, dateRange)
      alert(`${reportType} report generated successfully!`)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report')
    }
  }

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      // TODO: Implement report export
      console.log('Exporting report:', selectedReport, format)
      alert(`Report exported as ${format.toUpperCase()} successfully!`)
    } catch (error) {
      console.error('Error exporting report:', error)
      alert('Failed to export report')
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
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">Generate comprehensive reports and view system analytics</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => exportReport('pdf')}
              className="btn-secondary text-sm"
            >
              Export PDF
            </button>
            <button
              onClick={() => exportReport('excel')}
              className="btn-secondary text-sm"
            >
              Export Excel
            </button>
            <button
              onClick={() => exportReport('csv')}
              className="btn-secondary text-sm"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'enrollments', name: 'Enrollments' },
              { id: 'certifications', name: 'Certifications' },
              { id: 'users', name: 'Users' },
              { id: 'courses', name: 'Courses' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedReport === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {selectedReport === 'overview' && reportData && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">System Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total Users</p>
                      <p className="text-2xl font-bold text-blue-900">{reportData.totalUsers.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Active Enrollments</p>
                      <p className="text-2xl font-bold text-green-900">{reportData.activeEnrollments.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Certifications Issued</p>
                      <p className="text-2xl font-bold text-purple-900">{reportData.totalCertifications}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-yellow-600">Completed Courses</p>
                      <p className="text-2xl font-bold text-yellow-900">{reportData.completedCourses}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-red-600">Pending Applications</p>
                      <p className="text-2xl font-bold text-red-900">{reportData.pendingApplications}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-indigo-600">Total Courses</p>
                      <p className="text-2xl font-bold text-indigo-900">{reportData.totalCourses}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'certifications' && reportData && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Certifications by Type</h3>
              <div className="space-y-4">
                {reportData.certificationsByType.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{cert.type}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(cert.count / Math.max(...reportData.certificationsByType.map(c => c.count))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-lg font-bold text-gray-900">{cert.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReport === 'courses' && reportData && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Completion Rates</h3>
              <div className="space-y-4">
                {reportData.courseCompletionRates.map((course, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{course.course}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${
                            course.rate >= 80 ? 'bg-green-600' : 
                            course.rate >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${course.rate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-lg font-bold text-gray-900">{course.rate}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Report Generation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Report Generation</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => generateReport('User Activity Report')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm font-medium text-gray-900">User Activity Report</div>
              <div className="text-xs text-gray-500">Detailed user engagement metrics</div>
            </button>
            
            <button
              onClick={() => generateReport('Course Performance Report')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="text-sm font-medium text-gray-900">Course Performance</div>
              <div className="text-xs text-gray-500">Course completion and success rates</div>
            </button>
            
            <button
              onClick={() => generateReport('Certification Report')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">🎓</div>
              <div className="text-sm font-medium text-gray-900">Certification Report</div>
              <div className="text-xs text-gray-500">TESDA certification statistics</div>
            </button>
            
            
            <button
              onClick={() => generateReport('Instructor Report')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">👨‍🏫</div>
              <div className="text-sm font-medium text-gray-900">Instructor Report</div>
              <div className="text-xs text-gray-500">Staff performance and workload</div>
            </button>
            
            <button
              onClick={() => generateReport('System Usage Report')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-900">System Usage</div>
              <div className="text-xs text-gray-500">Platform usage and analytics</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}