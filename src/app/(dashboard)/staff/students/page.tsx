'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Eye, Users, BookOpen, CheckCircle, AlertCircle, Clock, BarChart3 } from 'lucide-react'

interface Student {
  id: string
  name: string
  email: string
  student_id: string
  enrolled_courses: string[]
  course_names: string[]
  overall_progress: number
  last_activity: string
  status: 'active' | 'at_risk' | 'excellent' | 'inactive'
  total_assignments: number
  completed_assignments: number
  average_score: number
  joined_date: string
  phone?: string
  address?: string
}

// Mock data
const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@lpunetwork.edu.ph',
    student_id: 'LPU-2024-001',
    enrolled_courses: ['1', '3'],
    course_names: ['Restaurant Service Operations', 'Front Desk Operations'],
    overall_progress: 85,
    last_activity: '2 hours ago',
    status: 'excellent',
    total_assignments: 12,
    completed_assignments: 10,
    average_score: 88,
    joined_date: '2024-01-15T00:00:00Z',
    phone: '+639123456789',
    address: 'Manila, Philippines'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@lpunetwork.edu.ph',
    student_id: 'LPU-2024-002',
    enrolled_courses: ['1', '2'],
    course_names: ['Restaurant Service Operations', 'Bar Operations and Beverage Service'],
    overall_progress: 45,
    last_activity: '1 day ago',
    status: 'at_risk',
    total_assignments: 10,
    completed_assignments: 4,
    average_score: 65,
    joined_date: '2024-01-10T00:00:00Z',
    phone: '+639987654321'
  },
  {
    id: '3',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@lpunetwork.edu.ph',
    student_id: 'LPU-2024-003',
    enrolled_courses: ['3'],
    course_names: ['Front Desk Operations'],
    overall_progress: 72,
    last_activity: '4 hours ago',
    status: 'active',
    total_assignments: 8,
    completed_assignments: 6,
    average_score: 78,
    joined_date: '2024-01-20T00:00:00Z'
  },
  {
    id: '4',
    name: 'Ana Rodriguez',
    email: 'ana.rodriguez@lpunetwork.edu.ph',
    student_id: 'LPU-2024-004',
    enrolled_courses: ['1', '2', '3'],
    course_names: ['Restaurant Service Operations', 'Bar Operations and Beverage Service', 'Front Desk Operations'],
    overall_progress: 92,
    last_activity: '1 hour ago',
    status: 'excellent',
    total_assignments: 18,
    completed_assignments: 17,
    average_score: 94,
    joined_date: '2024-01-05T00:00:00Z',
    phone: '+639555123456',
    address: 'Quezon City, Philippines'
  },
  {
    id: '5',
    name: 'Roberto Garcia',
    email: 'roberto.garcia@lpunetwork.edu.ph',
    student_id: 'LPU-2024-005',
    enrolled_courses: ['2'],
    course_names: ['Bar Operations and Beverage Service'],
    overall_progress: 15,
    last_activity: '1 week ago',
    status: 'inactive',
    total_assignments: 6,
    completed_assignments: 1,
    average_score: 45,
    joined_date: '2024-01-25T00:00:00Z'
  }
]

const statusColors = {
  excellent: 'bg-green-100 text-green-800',
  active: 'bg-blue-100 text-blue-800',
  at_risk: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-red-100 text-red-800'
}

const statusIcons = {
  excellent: CheckCircle,
  active: BookOpen,
  at_risk: AlertCircle,
  inactive: Clock
}

export default function StaffStudentsPage() {
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Get unique courses for filter
  const allCourses = Array.from(new Set(students.flatMap(student => student.course_names)))

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus
    const matchesCourse = selectedCourse === 'all' || student.course_names.includes(selectedCourse)
    return matchesSearch && matchesStatus && matchesCourse
  })

  // Statistics
  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active' || s.status === 'excellent').length,
    atRiskStudents: students.filter(s => s.status === 'at_risk').length,
    avgProgress: Math.round(students.reduce((sum, student) => sum + student.overall_progress, 0) / students.length)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600'
    if (progress >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
          <p className="text-gray-600 mt-1">Monitor student progress and manage enrollments</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            {/*  - Lucide icon type issue with strict TypeScript */}
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeStudents}</p>
            </div>
            {/*  - Lucide icon type issue with strict TypeScript */}
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">At Risk</p>
              <p className="text-2xl font-bold text-gray-900">{stats.atRiskStudents}</p>
            </div>
            {/*  - Lucide icon type issue with strict TypeScript */}
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgProgress}%</p>
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
                  placeholder="Search students..."
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
              <option value="excellent">Excellent</option>
              <option value="active">Active</option>
              <option value="at_risk">At Risk</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Courses</option>
              {allCourses.map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Students List */}
        <div className="p-6">
          <div className="space-y-4">
            {filteredStudents.map((student) => {
              const StatusIcon = statusIcons[student.status]
              return (
                <div key={student.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-medium text-blue-600">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {student.student_id}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusColors[student.status]}`}>
                            {/*  - Lucide icon type issue with strict TypeScript */}
                            <StatusIcon className="w-3 h-3" />
                            <span className="capitalize">{student.status.replace('_', ' ')}</span>
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-2">{student.email}</p>
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">Enrolled Courses:</p>
                          <div className="flex flex-wrap gap-1">
                            {student.course_names.map((course, index) => (
                              <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {course}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            {/*  - Lucide icon type issue with strict TypeScript */}
                            <BarChart3 className="w-4 h-4 text-gray-400" />
                            <span className={getProgressColor(student.overall_progress)}>
                              {student.overall_progress}% progress
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/*  - Lucide icon type issue with strict TypeScript */}
                            <CheckCircle className="w-4 h-4 text-gray-400" />
                            <span>{student.completed_assignments}/{student.total_assignments} assignments</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/*  - Lucide icon type issue with strict TypeScript */}
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className={getScoreColor(student.average_score)}>
                              {student.average_score}% avg score
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/*  - Lucide icon type issue with strict TypeScript */}
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>Active {student.last_activity}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-500">
                          Joined: {formatDate(student.joined_date)}
                          {student.phone && ` • Phone: ${student.phone}`}
                          {student.address && ` • ${student.address}`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {/*  - Next.js Link component type issue with strict TypeScript */}
                      <Link
                        href={`/staff/students/${student.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Student Profile"
                      >
                        {/*  - Lucide icon type issue with strict TypeScript */}
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              {/*  - Lucide icon type issue with strict TypeScript */}
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedStatus !== 'all' || selectedCourse !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No students are currently enrolled in your courses'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}