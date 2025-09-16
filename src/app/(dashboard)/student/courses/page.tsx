'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { initializeCourseContent, isCourseContentInitialized, markCourseContentInitialized } from '@/lib/initialize-course-content'

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
  coursePassword?: string // Password for student self-enrollment
  allowSelfEnrollment: boolean // Whether students can self-enroll with password
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

export default function StudentCourses() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'available' | 'enrolled' | 'completed'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedCourseForEnrollment, setSelectedCourseForEnrollment] = useState<Course | null>(null)
  const [passwordInput, setPasswordInput] = useState('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState<Course | null>(null)
  const [showDropdownMenu, setShowDropdownMenu] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 DEBUG: Fetching courses and enrollments...')
        
        // Initialize course content if not already done
        if (!isCourseContentInitialized()) {
          initializeCourseContent()
          markCourseContentInitialized()
          console.log('🔍 DEBUG: Course content initialized')
        }
        
        // Get courses from the same source as admin (localStorage + API)
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
          
          // Merge courses (same logic as staff) and ensure all fields are present
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
              courseId: '1', // Assuming course ID 1 exists
              studentId: 'current-student',
              enrollmentDate: '2024-01-15',
              progress: 85,
              status: 'enrolled',
              lessonsCompleted: 17,
              totalLessons: 20,
              nextLesson: 'Wine Service and Pairing'
            },
            {
              id: '2',
              courseId: '2', // Assuming course ID 2 exists
              studentId: 'current-student',
              enrollmentDate: '2023-10-01',
              progress: 100,
              status: 'completed',
              finalGrade: 92,
              completionDate: '2023-12-15',
              lessonsCompleted: 15,
              totalLessons: 15
            }
          ]
          console.log('🔍 DEBUG: Added default student enrollments')
          localStorage.setItem('student-enrollments', JSON.stringify(studentEnrollments))
        }

        setEnrollments(studentEnrollments)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdownMenu) {
        setShowDropdownMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdownMenu])

  const getEnrollmentForCourse = (courseId: string) => {
    return enrollments.find(enrollment => enrollment.courseId === courseId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'enrolled':
        return 'text-blue-600 bg-blue-100'
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

  const handleViewDetails = (course: Course) => {
    setSelectedCourseForDetails(course)
    setShowDetailsModal(true)
  }

  const handleEnrollInCourse = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (!course) return

    // Check if already enrolled
    const existingEnrollment = getEnrollmentForCourse(courseId)
    if (existingEnrollment && existingEnrollment.status !== 'dropped') {
      alert('You are already enrolled in this course!')
      return
    }

    // Check if course is full
    if (course.enrolledStudents >= course.maxStudents) {
      alert('This course is full. Please try again later.')
      return
    }

    // Check if course is active
    if (course.status !== 'active') {
      alert('This course is not currently available for enrollment.')
      return
    }

    // Check if course requires password for self-enrollment
    if (course.allowSelfEnrollment && course.coursePassword && course.coursePassword.trim() !== '') {
      setSelectedCourseForEnrollment(course)
      setShowPasswordModal(true)
      return
    }

    // If no password required but self-enrollment is disabled, show message
    if (!course.allowSelfEnrollment) {
      alert('This course requires staff approval for enrollment. Please contact your instructor or administrator.')
      return
    }

    // Proceed with enrollment (no password required)
    await performEnrollment(courseId)
  }

  const handlePasswordSubmit = async () => {
    if (!selectedCourseForEnrollment) return

    if (passwordInput !== selectedCourseForEnrollment.coursePassword) {
      alert('Incorrect password. Please try again.')
      return
    }

    setShowPasswordModal(false)
    setPasswordInput('')
    await performEnrollment(selectedCourseForEnrollment.id)
    setSelectedCourseForEnrollment(null)
  }

  const performEnrollment = async (courseId: string) => {
    try {
      console.log('🔍 DEBUG: Enrolling in course:', courseId)

      // Create new enrollment
      const foundCourse = courses.find(c => c.id === courseId)
      const newEnrollment: StudentEnrollment = {
        id: Date.now().toString(),
        courseId: courseId,
        studentId: 'current-student',
        enrollmentDate: new Date().toISOString().split('T')[0],
        progress: 0,
        status: 'enrolled',
        lessonsCompleted: 0,
        totalLessons: foundCourse?.totalLessons || 20, // Use course data or default
        nextLesson: 'Introduction'
      }

      const updatedEnrollments = [...enrollments, newEnrollment]
      setEnrollments(updatedEnrollments)

      // Update course enrollment count
      const updatedCourses = courses.map(course =>
        course.id === courseId
          ? { ...course, enrolledStudents: course.enrolledStudents + 1 }
          : course
      )
      setCourses(updatedCourses)

      // Save to localStorage
      localStorage.setItem('student-enrollments', JSON.stringify(updatedEnrollments))
      
      // Update admin courses data as well
      try {
        const storedCourses = localStorage.getItem('demo-courses')
        if (storedCourses) {
          const adminCourses = JSON.parse(storedCourses)
          const updatedAdminCourses = adminCourses.map((course: Course) =>
            course.id === courseId
              ? { ...course, enrolledStudents: course.enrolledStudents + 1 }
              : course
          )
          localStorage.setItem('demo-courses', JSON.stringify(updatedAdminCourses))
          console.log('🔍 DEBUG: Updated admin courses enrollment count')
        }
      } catch (error) {
        console.error('🔍 DEBUG: Error updating admin courses:', error)
      }

      // Also update demo-enrollments for admin view
      try {
        const adminEnrollments = JSON.parse(localStorage.getItem('demo-enrollments') || '[]')
        const newAdminEnrollment = {
          id: Date.now().toString(),
          studentId: 'current-student',
          courseId: courseId,
          enrolledAt: new Date().toISOString(),
          status: 'active',
          progress: 0
        }
        adminEnrollments.push(newAdminEnrollment)
        localStorage.setItem('demo-enrollments', JSON.stringify(adminEnrollments))
      } catch (error) {
        console.error('🔍 DEBUG: Error updating admin enrollments:', error)
      }

      alert('Successfully enrolled in the course!')
    } catch (error) {
      console.error('🔍 DEBUG: Error enrolling in course:', error)
      alert('Error enrolling in course. Please try again.')
    }
  }

  const handleDropCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to drop this course? This action cannot be undone.')) {
      return
    }

    try {
      console.log('🔍 DEBUG: Dropping course:', courseId)
      
      // Update enrollment status
      const updatedEnrollments = enrollments.map(enrollment =>
        enrollment.courseId === courseId
          ? { ...enrollment, status: 'dropped' as const }
          : enrollment
      )
      setEnrollments(updatedEnrollments)

      // Update course enrollment count
      const updatedCourses = courses.map(course =>
        course.id === courseId
          ? { ...course, enrolledStudents: Math.max(0, course.enrolledStudents - 1) }
          : course
      )
      setCourses(updatedCourses)

      // Save to localStorage
      localStorage.setItem('student-enrollments', JSON.stringify(updatedEnrollments))
      
      // Update admin courses data as well
      try {
        const storedCourses = localStorage.getItem('demo-courses')
        if (storedCourses) {
          const adminCourses = JSON.parse(storedCourses)
          const updatedAdminCourses = adminCourses.map((course: Course) =>
            course.id === courseId
              ? { ...course, enrolledStudents: Math.max(0, course.enrolledStudents - 1) }
              : course
          )
          localStorage.setItem('demo-courses', JSON.stringify(updatedAdminCourses))
          console.log('🔍 DEBUG: Updated admin courses enrollment count')
        }
      } catch (error) {
        console.error('🔍 DEBUG: Error updating admin courses:', error)
      }

      alert('Successfully dropped the course.')
    } catch (error) {
      console.error('🔍 DEBUG: Error dropping course:', error)
      alert('Error dropping course. Please try again.')
    }
  }

  const filteredCourses = courses.filter(course => {
    const enrollment = getEnrollmentForCourse(course.id)
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesSearch = searchTerm === '' ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesCategory || !matchesSearch) return false

    const isEnrolled = enrollment && enrollment.status !== 'dropped'
    const isAvailable = !enrollment || enrollment.status === 'dropped'
    const isSearchingOrFiltering = searchTerm.trim() !== '' || selectedCategory !== 'all'

    switch (filter) {
      case 'available':
        // Only show available courses if user is actively searching/filtering
        return isAvailable && isSearchingOrFiltering
      case 'enrolled':
        return enrollment && enrollment.status === 'enrolled'
      case 'completed':
        return enrollment && enrollment.status === 'completed'
      default:
        // For 'all' filter, always show enrolled/completed courses
        // But only show available courses if user is searching/filtering
        if (isEnrolled) {
          return true
        } else if (isAvailable) {
          return isSearchingOrFiltering
        }
        return false
    }
  })

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
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-2">Enroll in courses and track your learning progress.</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              {
                key: 'all',
                label: 'All Courses',
                count: enrollments.filter(e => e.status !== 'dropped').length +
                       (searchTerm.trim() !== '' || selectedCategory !== 'all' ?
                        courses.filter(c => !getEnrollmentForCourse(c.id) || getEnrollmentForCourse(c.id)?.status === 'dropped').length : 0)
              },
              {
                key: 'available',
                label: 'Available',
                count: searchTerm.trim() !== '' || selectedCategory !== 'all' ?
                       courses.filter(c => !getEnrollmentForCourse(c.id) || getEnrollmentForCourse(c.id)?.status === 'dropped').length : 0
              },
              { key: 'enrolled', label: 'Enrolled', count: enrollments.filter(e => e.status === 'enrolled').length },
              { key: 'completed', label: 'Completed', count: enrollments.filter(e => e.status === 'completed').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Courses</label>
              <input
                type="text"
                placeholder="Search by title, description, instructor, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="Food & Beverages">Food & Beverages</option>
                <option value="Front Office">Front Office</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Tourism">Tourism</option>
                <option value="Cookery">Cookery</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
          <div className="text-sm text-gray-600">Available Courses</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {enrollments.filter(e => e.status === 'enrolled').length}
          </div>
          <div className="text-sm text-gray-600">Currently Enrolled</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {enrollments.filter(e => e.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / Math.max(enrollments.length, 1))}%
          </div>
          <div className="text-sm text-gray-600">Average Progress</div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => {
          const enrollment = getEnrollmentForCourse(course.id)
          const isEnrolled = enrollment && enrollment.status !== 'dropped'
          const isCompleted = enrollment && enrollment.status === 'completed'
          const canEnroll = course.enrolledStudents < course.maxStudents
          const requiresPassword = course.allowSelfEnrollment && course.coursePassword
          const canSelfEnroll = course.allowSelfEnrollment

          return (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                    {course.code && (
                      <span className="text-sm text-gray-500 font-mono">({course.code})</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(course.category)}`}>
                      {course.category}
                    </span>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {course.level}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.status === 'active' ? 'bg-green-100 text-green-800' :
                      course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                {isEnrolled && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(enrollment.status)}`}>
                    {enrollment.status.toUpperCase()}
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-4">{course.description}</p>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Instructor:</span>
                  <span className="font-medium">{course.instructor}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{course.duration} hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Enrollment:</span>
                  <span className="font-medium">{course.enrolledStudents}/{course.maxStudents}</span>
                </div>
                {course.totalLessons > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Lessons:</span>
                    <span className="font-medium">{course.totalLessons} lessons</span>
                  </div>
                )}

                {isEnrolled && enrollment && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium">{enrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Lessons Completed:</span>
                      <span className="font-medium">{enrollment.lessonsCompleted}/{enrollment.totalLessons}</span>
                    </div>
                    {enrollment.nextLesson && (
                      <div className="text-sm">
                        <span className="text-gray-600">Next Lesson:</span>
                        <span className="ml-2 font-medium text-blue-600">{enrollment.nextLesson}</span>
                      </div>
                    )}
                    {enrollment.finalGrade && (
                      <div className="text-sm">
                        <span className="text-gray-600">Final Grade:</span>
                        <span className="ml-2 font-medium text-green-600">{enrollment.finalGrade}%</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {isEnrolled && enrollment ? `Enrolled: ${enrollment.enrollmentDate}` : 'Not enrolled'}
                  {enrollment?.completionDate && (
                    <span className="ml-2">• Completed: {enrollment.completionDate}</span>
                  )}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleViewDetails(course)}
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                  >
                    View Details
                  </button>
                  {!isEnrolled && canEnroll && canSelfEnroll && course.status === 'active' && (
                    <button
                      onClick={() => handleEnrollInCourse(course.id)}
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-medium"
                      title={requiresPassword ? 'Password required for enrollment' : 'Enroll now'}
                    >
                      {requiresPassword ? '🔒 Enroll with Password' : 'Enroll Now'}
                    </button>
                  )}
                  {!isEnrolled && canEnroll && !canSelfEnroll && (
                    <span className="text-sm text-gray-500 px-3 py-1" title="Staff approval required">
                      Staff Approval Required
                    </span>
                  )}
                  {!isEnrolled && !canEnroll && (
                    <span className="text-sm text-gray-500 px-3 py-1">Course Full</span>
                  )}
                  {!isEnrolled && course.status !== 'active' && (
                    <span className="text-sm text-gray-500 px-3 py-1">Not Available</span>
                  )}
                  {isEnrolled && enrollment?.status === 'enrolled' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/student/courses/${course.id}`)}
                        className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-medium"
                      >
                        Continue Learning
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setShowDropdownMenu(showDropdownMenu === course.id ? null : course.id)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                          title="More options"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        {showDropdownMenu === course.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  handleViewDetails(course)
                                  setShowDropdownMenu(null)
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                View Course Details
                              </button>
                              <button
                                onClick={() => {
                                  router.push(`/student/courses/${course.id}`)
                                  setShowDropdownMenu(null)
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Go to Course Content
                              </button>
                              <div className="border-t border-gray-100"></div>
                              <button
                                onClick={() => {
                                  handleDropCourse(course.id)
                                  setShowDropdownMenu(null)
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Drop Course
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {isCompleted && (
                    <span className="text-sm text-green-600 font-medium">✓ Completed</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? searchTerm.trim() === '' && selectedCategory === 'all'
                ? 'Use the search bar or category filter to discover available courses.'
                : 'No courses match your search criteria.'
              : filter === 'available' && searchTerm.trim() === '' && selectedCategory === 'all'
                ? 'Use the search bar or category filter to discover available courses.'
                : `No courses match the "${filter}" filter.`
            }
          </p>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && selectedCourseForEnrollment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Course Password Required
            </h3>
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Please enter the password to enroll in:
              </p>
              <p className="font-medium text-gray-900 mb-4">
                "{selectedCourseForEnrollment.title}" ({selectedCourseForEnrollment.code})
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter course password"
                autoFocus
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                💡 Contact your instructor if you don't have the course password.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handlePasswordSubmit}
                disabled={!passwordInput.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium"
              >
                Enroll in Course
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordInput('')
                  setSelectedCourseForEnrollment(null)
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Details Modal */}
      {showDetailsModal && selectedCourseForDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Course Details: {selectedCourseForDetails.title}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900 mt-1">{selectedCourseForDetails.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedCourseForDetails.category)} mt-1`}>
                    {selectedCourseForDetails.category}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Level</label>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 mt-1">
                    {selectedCourseForDetails.level}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedCourseForDetails.duration} hours</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Instructor</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedCourseForDetails.instructor}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enrollment</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedCourseForDetails.enrolledStudents}/{selectedCourseForDetails.maxStudents} students</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(selectedCourseForDetails.enrolledStudents / selectedCourseForDetails.maxStudents) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enrollment Status</label>
                  <div className="mt-1">
                    {selectedCourseForDetails.allowSelfEnrollment ? (
                      <span className="text-green-600 text-sm">
                        ✓ Self-enrollment {selectedCourseForDetails.coursePassword ? 'with password' : 'open'}
                      </span>
                    ) : (
                      <span className="text-orange-600 text-sm">
                        ⚠️ Admin approval required
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900 mt-1">{new Date(selectedCourseForDetails.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-sm text-gray-900 mt-1">{new Date(selectedCourseForDetails.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Show enrollment info if enrolled */}
              {(() => {
                const enrollment = getEnrollmentForCourse(selectedCourseForDetails.id)
                if (enrollment && enrollment.status !== 'dropped') {
                  return (
                    <div className="border-t pt-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Your Enrollment</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Progress</label>
                          <p className="text-sm text-gray-900 mt-1">{enrollment.progress}%</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(enrollment.status)} mt-1`}>
                            {enrollment.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Lessons Completed</label>
                          <p className="text-sm text-gray-900 mt-1">{enrollment.lessonsCompleted}/{enrollment.totalLessons}</p>
                        </div>
                        {enrollment.nextLesson && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Next Lesson</label>
                            <p className="text-sm text-blue-600 mt-1 font-medium">{enrollment.nextLesson}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedCourseForDetails(null)
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}