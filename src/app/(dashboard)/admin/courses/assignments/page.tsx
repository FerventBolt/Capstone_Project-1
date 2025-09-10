'use client'

import { useState, useEffect } from 'react'

interface Assignment {
  id: string
  courseId: string
  courseTitle: string
  instructorId: string
  instructorName: string
  instructorEmail: string
  assignedAt: string
  status: 'active' | 'inactive'
  enrolledStudents: number
  maxStudents: number
}

interface Instructor {
  id: string
  name: string
  email: string
  specialization: string[]
  activeAssignments: number
}

export default function CourseAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedInstructor, setSelectedInstructor] = useState<string>('')

  useEffect(() => {
    // TODO: Fetch real data from Supabase
    const fetchData = async () => {
      try {
        // Mock data for now
        setAssignments([
          {
            id: '1',
            courseId: '1',
            courseTitle: 'Restaurant Service Operations NC II',
            instructorId: '1',
            instructorName: 'Maria Santos',
            instructorEmail: 'maria.santos@lpu.edu.ph',
            assignedAt: '2024-01-01 09:00:00',
            status: 'active',
            enrolledStudents: 25,
            maxStudents: 30
          },
          {
            id: '2',
            courseId: '2',
            courseTitle: 'Front Desk Operations NC II',
            instructorId: '2',
            instructorName: 'Juan Dela Cruz',
            instructorEmail: 'juan.delacruz@lpu.edu.ph',
            assignedAt: '2024-01-02 10:00:00',
            status: 'active',
            enrolledStudents: 18,
            maxStudents: 25
          },
          {
            id: '3',
            courseId: '3',
            courseTitle: 'Housekeeping Services NC II',
            instructorId: '3',
            instructorName: 'Ana Rodriguez',
            instructorEmail: 'ana.rodriguez@lpu.edu.ph',
            assignedAt: '2024-01-03 11:00:00',
            status: 'active',
            enrolledStudents: 22,
            maxStudents: 28
          }
        ])

        setInstructors([
          {
            id: '1',
            name: 'Maria Santos',
            email: 'maria.santos@lpu.edu.ph',
            specialization: ['Food & Beverages', 'Customer Service'],
            activeAssignments: 1
          },
          {
            id: '2',
            name: 'Juan Dela Cruz',
            email: 'juan.delacruz@lpu.edu.ph',
            specialization: ['Front Office', 'Hotel Management'],
            activeAssignments: 1
          },
          {
            id: '3',
            name: 'Ana Rodriguez',
            email: 'ana.rodriguez@lpu.edu.ph',
            specialization: ['Housekeeping', 'Facility Management'],
            activeAssignments: 1
          },
          {
            id: '4',
            name: 'Carlos Mendoza',
            email: 'carlos.mendoza@lpu.edu.ph',
            specialization: ['Cookery', 'Food Safety'],
            activeAssignments: 0
          },
          {
            id: '5',
            name: 'Elena Reyes',
            email: 'elena.reyes@lpu.edu.ph',
            specialization: ['Tourism', 'Travel Management'],
            activeAssignments: 0
          }
        ])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAssignInstructor = async () => {
    if (!selectedCourse || !selectedInstructor) return

    try {
      // TODO: Implement Supabase assignment creation
      console.log('Assigning instructor:', { courseId: selectedCourse, instructorId: selectedInstructor })
      
      // Mock assignment
      const instructor = instructors.find(i => i.id === selectedInstructor)
      if (instructor) {
        const newAssignment: Assignment = {
          id: Date.now().toString(),
          courseId: selectedCourse,
          courseTitle: `Course ${selectedCourse}`,
          instructorId: selectedInstructor,
          instructorName: instructor.name,
          instructorEmail: instructor.email,
          assignedAt: new Date().toISOString(),
          status: 'active',
          enrolledStudents: 0,
          maxStudents: 30
        }
        
        setAssignments(prev => [newAssignment, ...prev])
        setInstructors(prev => prev.map(inst => 
          inst.id === selectedInstructor 
            ? { ...inst, activeAssignments: inst.activeAssignments + 1 }
            : inst
        ))
      }
      
      setShowAssignModal(false)
      setSelectedCourse('')
      setSelectedInstructor('')
      alert('Instructor assigned successfully!')
    } catch (error) {
      console.error('Error assigning instructor:', error)
      alert('Failed to assign instructor')
    }
  }

  const handleUnassign = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to unassign this instructor?')) return

    try {
      // TODO: Implement Supabase assignment deletion
      console.log('Unassigning instructor:', assignmentId)
      
      const assignment = assignments.find(a => a.id === assignmentId)
      if (assignment) {
        setAssignments(prev => prev.filter(a => a.id !== assignmentId))
        setInstructors(prev => prev.map(inst => 
          inst.id === assignment.instructorId 
            ? { ...inst, activeAssignments: Math.max(0, inst.activeAssignments - 1) }
            : inst
        ))
      }
      
      alert('Instructor unassigned successfully!')
    } catch (error) {
      console.error('Error unassigning instructor:', error)
      alert('Failed to unassign instructor')
    }
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
                    <div className="text-sm font-medium text-gray-900">{assignment.courseTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assignment.instructorName}</div>
                    <div className="text-sm text-gray-500">{assignment.instructorEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {assignment.enrolledStudents}/{assignment.maxStudents}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(assignment.enrolledStudents / assignment.maxStudents) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(assignment.assignedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleUnassign(assignment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Unassign
                    </button>
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
                  <h4 className="text-md font-medium text-gray-900">{instructor.name}</h4>
                  <span className="text-sm text-gray-500">
                    {instructor.activeAssignments} active
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
                  <option value="1">Restaurant Service Operations NC II</option>
                  <option value="2">Front Desk Operations NC II</option>
                  <option value="3">Housekeeping Services NC II</option>
                  <option value="4">Commercial Cooking NC II</option>
                  <option value="5">Tourism Promotion Services NC III</option>
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
                      {instructor.name} ({instructor.activeAssignments} active)
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