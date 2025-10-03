'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDebugPage(): JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  // Users Debug Functions
  const createTestUser = async () => {
    setLoading('user')
    try {
      const testUser = {
        id: Date.now().toString(),
        email: `test.user.${Date.now()}@lpu.edu.ph`,
        firstName: 'Test',
        lastName: 'User',
        role: 'student' as const,
        status: 'active' as const,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      const existingUsers = JSON.parse(localStorage.getItem('demo-users') || '[]')
      const updatedUsers = [...existingUsers, testUser]
      localStorage.setItem('demo-users', JSON.stringify(updatedUsers))
      
      console.log('🔍 DEBUG: Test user created:', testUser)
      console.log('🔍 DEBUG: Total users:', updatedUsers.length)
      alert(`Test user created successfully! Total users: ${updatedUsers.length}`)
    } catch (error) {
      console.error('Error creating test user:', error)
      alert('Error creating test user')
    } finally {
      setLoading(null)
    }
  }

  // Courses Debug Functions
  const createTestCourse = async () => {
    setLoading('course')
    try {
      const testCourseData = {
        title: `Test Course - ${Date.now()}`,
        description: 'This is a test course to verify localStorage persistence.',
        category: 'Food & Beverages',
        level: 'NC II',
        duration: 100,
        maxStudents: 25,
        instructor: 'Test Instructor',
        prerequisites: 'None',
        objectives: ['Test objective 1'],
        modules: []
      }

      // Call the API endpoint
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCourseData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create course')
      }

      // Store in localStorage
      const existingCourses = JSON.parse(localStorage.getItem('demo-courses') || '[]')
      const updatedCourses = [...existingCourses, result.course]
      localStorage.setItem('demo-courses', JSON.stringify(updatedCourses))
      
      console.log('🔍 DEBUG: Test course created:', result.course)
      console.log('🔍 DEBUG: Total courses:', updatedCourses.length)
      alert(`Test course created successfully! Total courses: ${updatedCourses.length}`)
    } catch (error) {
      console.error('Error creating test course:', error)
      alert('Error creating test course')
    } finally {
      setLoading(null)
    }
  }

  // Certifications Debug Functions
  const createTestCertification = async () => {
    setLoading('certification')
    try {
      const testCertification = {
        id: Date.now().toString(),
        name: `Test Certification - ${Date.now()}`,
        code: `TEST-${Date.now()}`,
        description: 'This is a test certification to verify localStorage persistence.',
        type: 'food_beverages' as const,
        duration_hours: 200,
        prerequisites: ['Basic Knowledge'],
        is_active: true,
        created_at: new Date().toISOString().split('T')[0],
        applications_count: 0,
        completions_count: 0
      }

      const existingCertifications = JSON.parse(localStorage.getItem('demo-certifications') || '[]')
      const updatedCertifications = [...existingCertifications, testCertification]
      localStorage.setItem('demo-certifications', JSON.stringify(updatedCertifications))
      
      console.log('🔍 DEBUG: Test certification created:', testCertification)
      console.log('🔍 DEBUG: Total certifications:', updatedCertifications.length)
      alert(`Test certification created successfully! Total certifications: ${updatedCertifications.length}`)
    } catch (error) {
      console.error('Error creating test certification:', error)
      alert('Error creating test certification')
    } finally {
      setLoading(null)
    }
  }

  // Invitations Debug Functions
  const createTestInvitation = async () => {
    setLoading('invitation')
    try {
      const testInvitation = {
        id: Date.now().toString(),
        email: `test.invite.${Date.now()}@lpu.edu.ph`,
        role: 'student' as const,
        invitationCode: `TEST${Date.now()}`,
        status: 'pending' as const,
        sentAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        sentBy: 'admin@lpu.edu.ph'
      }

      const existingInvitations = JSON.parse(localStorage.getItem('demo-invitations') || '[]')
      const updatedInvitations = [testInvitation, ...existingInvitations]
      localStorage.setItem('demo-invitations', JSON.stringify(updatedInvitations))
      
      console.log('🔍 DEBUG: Test invitation created:', testInvitation)
      console.log('🔍 DEBUG: Total invitations:', updatedInvitations.length)
      alert(`Test invitation created successfully! Total invitations: ${updatedInvitations.length}`)
    } catch (error) {
      console.error('Error creating test invitation:', error)
      alert('Error creating test invitation')
    } finally {
      setLoading(null)
    }
  }

  // General Debug Functions
  const checkAllLocalStorage = () => {
    try {
      const users = JSON.parse(localStorage.getItem('demo-users') || '[]')
      const courses = JSON.parse(localStorage.getItem('demo-courses') || '[]')
      const certifications = JSON.parse(localStorage.getItem('demo-certifications') || '[]')
      const certApplications = JSON.parse(localStorage.getItem('demo-cert-applications') || '[]')
      const invitations = JSON.parse(localStorage.getItem('demo-invitations') || '[]')

      console.log('🔍 DEBUG: All localStorage data:')
      console.log('- Users:', users.length, users)
      console.log('- Courses:', courses.length, courses)
      console.log('- Certifications:', certifications.length, certifications)
      console.log('- Cert Applications:', certApplications.length, certApplications)
      console.log('- Invitations:', invitations.length, invitations)

      alert(`localStorage Summary:
Users: ${users.length}
Courses: ${courses.length}
Certifications: ${certifications.length}
Cert Applications: ${certApplications.length}
Invitations: ${invitations.length}

Check console for detailed data.`)
    } catch (error) {
      console.error('Error reading localStorage:', error)
      alert('Error reading localStorage')
    }
  }

  const clearAllLocalStorage = () => {
    if (confirm('Are you sure you want to clear ALL localStorage data? This will remove all test data.')) {
      try {
        localStorage.removeItem('demo-users')
        localStorage.removeItem('demo-courses')
        localStorage.removeItem('demo-certifications')
        localStorage.removeItem('demo-cert-applications')
        localStorage.removeItem('demo-invitations')
        
        console.log('🔍 DEBUG: All localStorage cleared')
        alert('All localStorage data cleared successfully')
      } catch (error) {
        console.error('Error clearing localStorage:', error)
        alert('Error clearing localStorage')
      }
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Debug Dashboard</h1>
        <p className="text-gray-600 mt-2">Test localStorage persistence for all admin sections</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Users Management</h3>
          <div className="space-y-3">
            <button
              onClick={createTestUser}
              disabled={loading === 'user'}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'user' ? 'Creating Test User...' : 'Create Test User'}
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="w-full btn-secondary"
            >
              Go to Users Management
            </button>
          </div>
        </div>

        {/* Courses Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Course Management</h3>
          <div className="space-y-3">
            <button
              onClick={createTestCourse}
              disabled={loading === 'course'}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'course' ? 'Creating Test Course...' : 'Create Test Course'}
            </button>
            <button
              onClick={() => router.push('/admin/courses')}
              className="w-full btn-secondary"
            >
              Go to Course Management
            </button>
            <button
              onClick={() => router.push('/admin/courses/create/test')}
              className="w-full btn-secondary"
            >
              Advanced Course Debug Tools
            </button>
          </div>
        </div>

        {/* Certifications Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Certifications</h3>
          <div className="space-y-3">
            <button
              onClick={createTestCertification}
              disabled={loading === 'certification'}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'certification' ? 'Creating Test Certification...' : 'Create Test Certification'}
            </button>
            <button
              onClick={() => router.push('/admin/certifications')}
              className="w-full btn-secondary"
            >
              Go to Certifications
            </button>
          </div>
        </div>

        {/* Invitations Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">✉️ Invitations</h3>
          <div className="space-y-3">
            <button
              onClick={createTestInvitation}
              disabled={loading === 'invitation'}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'invitation' ? 'Creating Test Invitation...' : 'Create Test Invitation'}
            </button>
            <button
              onClick={() => router.push('/admin/users/invitations')}
              className="w-full btn-secondary"
            >
              Go to Invitations
            </button>
          </div>
        </div>
      </div>

      {/* Global Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Global Debug Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={checkAllLocalStorage}
            className="btn-secondary"
          >
            Check All localStorage
          </button>
          <button
            onClick={clearAllLocalStorage}
            className="btn-secondary bg-red-50 text-red-600 hover:bg-red-100"
          >
            Clear All localStorage
          </button>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="btn-secondary"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 Testing Instructions</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>1. Create Test Data:</strong> Use the buttons above to create test data for each section</p>
          <p><strong>2. Verify Persistence:</strong> Navigate to each section and verify the data appears</p>
          <p><strong>3. Test Refresh:</strong> Refresh the page and verify data persists</p>
          <p><strong>4. Check Console:</strong> Open browser console to see detailed debug logs</p>
          <p><strong>5. Clear Data:</strong> Use "Clear All localStorage" to reset for fresh testing</p>
        </div>
      </div>
    </div>
  )
}