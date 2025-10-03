'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/supabase-client'

interface Assignment {
  id: string
  course_id: string
  instructor_id: string
  assigned_at: string
  status: 'active' | 'inactive'
  max_students: number
}

interface Course {
  id: string
  title: string
}

interface Instructor {
  id: string
  full_name: string
  email: string
  specialization: string[]
  active_assignments: number
}

export default function CourseAssignmentsPage() {
  const [assignments, setAssignments] = useState<(Assignment & { course: Course | null, instructor: Instructor | null, enrolled_students: number })[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedInstructor, setSelectedInstructor] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // Fetch courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title')
      setCourses(coursesData || [])

      // Fetch instructors (staff profiles)
      const { data: instructorsData } = await supabase
        .from('profiles')
        .select('id, full_name, email, specialization')
        .eq('role', 'staff')
      // Count active assignments for each instructor
      let instructorsWithCount: Instructor[] = []
      if (instructorsData) {
        for (const inst of instructorsData) {
          const { count } = await supabase
            .from('course_assignments')
            .select('*', { count: 'exact', head: true })
            .eq('instructor_id', inst.id)
            .eq('status', 'active')
          instructorsWithCount.push({
            id: inst.id,
            full_name: inst.full_name,
            email: inst.email,
            specialization: inst.specialization || [],
            active_assignments: count ?? 0,
          })
        }
      }
      setInstructors(instructorsWithCount)

      // Fetch assignments
      const { data: assignmentsData } = await supabase
        .from('course_assignments')
        .select('*')
        .order('assigned_at', { ascending: false })

      // For each assignment, fetch course, instructor, and enrolled students count
      let assignmentsWithDetails: (Assignment & { course: Course | null, instructor: Instructor | null, enrolled_students: number })[] = []
      if (assignmentsData) {
        for (const a of assignmentsData) {
          // Course
          const course = coursesData?.find((c: Course) => c.id === a.course_id) || null
          // Instructor
          const instructor = instructorsWithCount.find(i => i.id === a.instructor_id) || null
          // Enrolled students
          const { count: enrolledCount } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', a.course_id)
          assignmentsWithDetails.push({
            ...a,
            course,
            instructor,
            enrolled_students: enrolledCount ?? 0,
          })
        }
      }
      setAssignments(assignmentsWithDetails)
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleAssignInstructor = async () => {
    if (!selectedCourse || !selectedInstructor) return
    setLoading(true)
    // Create assignment in Supabase
    const { error } = await supabase
      .from('course_assignments')
      .insert([{
        course_id: selectedCourse,
        instructor_id: selectedInstructor,
        assigned_at: new Date().toISOString(),
        status: 'active',
        max_students: 30
      }])
    if (error) {
      alert('Failed to assign instructor: ' + error.message)
    } else {
      setShowAssignModal(false)
      setSelectedCourse('')
      setSelectedInstructor('')
      // Refresh data
      window.location.reload()
    }
    setLoading(false)
  }

  const handleUnassign = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to unassign this instructor?')) return
    setLoading(true)
    // Set assignment status to inactive
    const { error } = await supabase
      .from('course_assignments')
      .update({ status: 'inactive' })
      .eq('id', assignmentId)
    if (error) {
      alert('Failed to unassign instructor: ' + error.message)
    } else {
      // Refresh data
      window.location.reload()
    }
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Assignments</h1>
            <p className="text-gray-600 mt-2">Manage instructor assignments to courses</p>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            className="btn-primary"
          >
            Assign Instructor
          </button>
        </div>
      </div>

      {/* Current Assignments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Current Assignments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assignment.course?.title ?? 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assignment.instructor?.full_name ?? 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{assignment.instructor?.email ?? ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {assignment.enrolled_students}/{assignment.max_students}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(assignment.enrolled_students / assignment.max_students) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleDateString() : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {assignment.status === 'active' && (
                      <button
                        onClick={() => handleUnassign(assignment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Unassign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Available Instructors */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Available Instructors</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instructors.map((instructor) => (
              <div key={instructor.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-900">{instructor.full_name}</h4>
                  <span className="text-sm text-gray-500">
                    {instructor.active_assignments} active
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{instructor.email}</p>
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Specializations:</p>
                  <div className="flex flex-wrap gap-1">
                    {instructor.specialization.map((spec, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="w-full text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assign Instructor Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Instructor to Course</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                <select
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Instructor</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.full_name} ({instructor.active_assignments} active)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAssignInstructor}
                disabled={!selectedCourse || !selectedInstructor}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedCourse('')
                  setSelectedInstructor('')
                }}
                className="btn-secondary flex-1"
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