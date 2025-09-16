'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, UserPlus, UserMinus, Mail, Phone, Calendar, BookOpen, TrendingUp } from 'lucide-react'

interface Course {
  id: string
  title: string
  code: string
  maxStudents: number
  enrolledStudents: number
}

interface Student {
  id: string
  name: string
  email: string
  phone?: string
  studentId: string
  enrolledAt?: string
  status: 'active' | 'inactive' | 'pending'
  progress: number
  lastActivity?: string
  completedLessons: number
  totalLessons: number
}

export default function CourseStudentManagementPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([])
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load course data (demo)
        const demoCourse: Course = {
          id: courseId,
          title: 'Food Service Operations NC II',
          code: 'FSO-NCII-2024',
          maxStudents: 25,
          enrolledStudents: 3
        }
        setCourse(demoCourse)

        // Load enrolled students (demo data)
        const demoEnrolledStudents: Student[] = [
          {
            id: 'stu-1',
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+63 912 345 6789',
            studentId: 'STU001',
            enrolledAt: '2024-01-15',
            status: 'active',
            progress: 75,
            lastActivity: '2024-01-20',
            completedLessons: 6,
            totalLessons: 8
          },
          {
            id: 'stu-2',
            name: 'Jane Smith',
            email: 'jane.smith@email.com',
            phone: '+63 912 345 6790',
            studentId: 'STU002',
            enrolledAt: '2024-01-16',
            status: 'active',
            progress: 60,
            lastActivity: '2024-01-19',
            completedLessons: 5,
            totalLessons: 8
          },
          {
            id: 'stu-3',
            name: 'Mike Johnson',
            email: 'mike.johnson@email.com',
            phone: '+63 912 345 6791',
            studentId: 'STU003',
            enrolledAt: '2024-01-17',
            status: 'active',
            progress: 90,
            lastActivity: '2024-01-21',
            completedLessons: 7,
            totalLessons: 8
          }
        ]
        setEnrolledStudents(demoEnrolledStudents)

        // Load available students (demo data)
        const demoAvailableStudents: Student[] = [
          {
            id: 'stu-4',
            name: 'Sarah Wilson',
            email: 'sarah.wilson@email.com',
            phone: '+63 912 345 6792',
            studentId: 'STU004',
            status: 'active',
            progress: 0,
            completedLessons: 0,
            totalLessons: 0
          },
          {
            id: 'stu-5',
            name: 'David Brown',
            email: 'david.brown@email.com',
            phone: '+63 912 345 6793',
            studentId: 'STU005',
            status: 'active',
            progress: 0,
            completedLessons: 0,
            totalLessons: 0
          },
          {
            id: 'stu-6',
            name: 'Lisa Garcia',
            email: 'lisa.garcia@email.com',
            phone: '+63 912 345 6794',
            studentId: 'STU006',
            status: 'active',
            progress: 0,
            completedLessons: 0,
            totalLessons: 0
          },
          {
            id: 'stu-7',
            name: 'Robert Martinez',
            email: 'robert.martinez@email.com',
            phone: '+63 912 345 6795',
            studentId: 'STU007',
            status: 'active',
            progress: 0,
            completedLessons: 0,
            totalLessons: 0
          }
        ]
        setAvailableStudents(demoAvailableStudents)

      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [courseId])

  const filteredEnrolledStudents = enrolledStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAvailableStudents = availableStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEnrollStudents = () => {
    if (selectedStudents.length === 0) {
      alert('Please select students to enroll')
      return
    }

    if (!course) return

    if (enrolledStudents.length + selectedStudents.length > course.maxStudents) {
      alert(`Cannot enroll ${selectedStudents.length} students. Course capacity is ${course.maxStudents} and ${enrolledStudents.length} are already enrolled.`)
      return
    }

    const studentsToEnroll = availableStudents.filter(student => 
      selectedStudents.includes(student.id)
    ).map(student => ({
      ...student,
      enrolledAt: new Date().toISOString().split('T')[0],
      totalLessons: 8 // Demo value
    }))

    setEnrolledStudents(prev => [...prev, ...studentsToEnroll])
    setAvailableStudents(prev => prev.filter(student => !selectedStudents.includes(student.id)))
    setSelectedStudents([])
    
    // Update course enrollment count
    setCourse(prev => prev ? { ...prev, enrolledStudents: prev.enrolledStudents + selectedStudents.length } : null)
    
    alert(`Successfully enrolled ${selectedStudents.length} student${selectedStudents.length > 1 ? 's' : ''}`)
  }

  const handleUnenrollStudent = (studentId: string) => {
    const student = enrolledStudents.find(s => s.id === studentId)
    if (!student) return

    if (confirm(`Are you sure you want to unenroll ${student.name} from this course?`)) {
      setEnrolledStudents(prev => prev.filter(s => s.id !== studentId))
      setAvailableStudents(prev => [...prev, { ...student, enrolledAt: undefined, progress: 0, completedLessons: 0, totalLessons: 0 }])
      
      // Update course enrollment count
      setCourse(prev => prev ? { ...prev, enrolledStudents: prev.enrolledStudents - 1 } : null)
      
      alert(`${student.name} has been unenrolled from the course`)
    }
  }

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredAvailableStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredAvailableStudents.map(s => s.id))
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
                href={`/admin/courses/${courseId}`}
                className="text-gray-500 hover:text-gray-700 mr-4 flex items-center"
              >
                {/*  - Lucide icon type issue with strict TypeScript */}
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Course
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Student Management</h1>
                <p className="text-sm text-gray-500">{course.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {enrolledStudents.length}/{course.maxStudents} enrolled
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enrolled Students</p>
                <p className="text-2xl font-bold text-gray-900">{enrolledStudents.length}</p>
              </div>
              {/*  - Lucide icon type issue with strict TypeScript */}
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Spots</p>
                <p className="text-2xl font-bold text-gray-900">{course.maxStudents - enrolledStudents.length}</p>
              </div>
              {/*  - Lucide icon type issue with strict TypeScript */}
              <Plus className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrolledStudents.length > 0 
                    ? Math.round(enrolledStudents.reduce((acc, s) => acc + s.progress, 0) / enrolledStudents.length)
                    : 0}%
                </p>
              </div>
              {/*  - Lucide icon type issue with strict TypeScript */}
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrolledStudents.length > 0 
                    ? Math.round((enrolledStudents.filter(s => s.progress === 100).length / enrolledStudents.length) * 100)
                    : 0}%
                </p>
              </div>
              {/*  - Lucide icon type issue with strict TypeScript */}
              <BookOpen className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
              </div>
              {activeTab === 'available' && selectedStudents.length > 0 && (
                <button
                  onClick={handleEnrollStudents}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                >
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <UserPlus className="w-4 h-4" />
                  <span>Enroll {selectedStudents.length} Student{selectedStudents.length > 1 ? 's' : ''}</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'enrolled'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Enrolled Students ({enrolledStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'available'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Available Students ({availableStudents.length})
            </button>
          </div>
        </div>

        {/* Enrolled Students Tab */}
        {activeTab === 'enrolled' && (
          <div className="space-y-4">
            {filteredEnrolledStudents.map((student) => (
              <div key={student.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{student.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          {/*  - Lucide icon type issue with strict TypeScript */}
                          <Mail className="w-4 h-4" />
                          <span>{student.email}</span>
                        </div>
                        {student.phone && (
                          <div className="flex items-center space-x-1">
                            {/*  - Lucide icon type issue with strict TypeScript */}
                            <Phone className="w-4 h-4" />
                            <span>{student.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          {/*  - Lucide icon type issue with strict TypeScript */}
                          <Calendar className="w-4 h-4" />
                          <span>Enrolled: {student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">ID: {student.studentId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{student.progress}% Complete</p>
                      <p className="text-xs text-gray-600">{student.completedLessons}/{student.totalLessons} lessons</p>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
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
                      
                      <button
                        onClick={() => handleUnenrollStudent(student.id)}
                        className="text-red-600 hover:text-red-500 text-sm font-medium flex items-center space-x-1"
                      >
                        {/*  - Lucide icon type issue with strict TypeScript */}
                        <UserMinus className="w-4 h-4" />
                        <span>Unenroll</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredEnrolledStudents.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No students found' : 'No students enrolled'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search criteria.'
                    : 'Students will appear here once they are enrolled in the course.'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Available Students Tab */}
        {activeTab === 'available' && (
          <div className="space-y-4">
            {availableStudents.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === filteredAvailableStudents.length && filteredAvailableStudents.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select All ({filteredAvailableStudents.length})
                    </span>
                  </label>
                  {selectedStudents.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>
              </div>
            )}

            {filteredAvailableStudents.map((student) => (
              <div key={student.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{student.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          {/*  - Lucide icon type issue with strict TypeScript */}
                          <Mail className="w-4 h-4" />
                          <span>{student.email}</span>
                        </div>
                        {student.phone && (
                          <div className="flex items-center space-x-1">
                            {/*  - Lucide icon type issue with strict TypeScript */}
                            <Phone className="w-4 h-4" />
                            <span>{student.phone}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">ID: {student.studentId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
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
              </div>
            ))}

            {filteredAvailableStudents.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No students found' : 'No available students'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search criteria.'
                    : 'All students are either enrolled or there are no students in the system.'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}