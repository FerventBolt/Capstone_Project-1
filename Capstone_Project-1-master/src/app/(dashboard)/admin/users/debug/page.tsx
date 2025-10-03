'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UsersDebugPage(): JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const createTestUser = async () => {
    setLoading(true)
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
      console.log('🔍 DEBUG: All users:', updatedUsers)
      alert(`Test user created successfully! Total users: ${updatedUsers.length}`)
    } catch (error) {
      console.error('Error creating test user:', error)
      alert('Error creating test user')
    } finally {
      setLoading(false)
    }
  }

  const createMultipleTestUsers = async () => {
    setLoading(true)
    try {
      const testUsers = [
        {
          id: `${Date.now()}-1`,
          email: `admin.test.${Date.now()}@lpu.edu.ph`,
          firstName: 'Admin',
          lastName: 'Test',
          role: 'admin' as const,
          status: 'active' as const,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `${Date.now()}-2`,
          email: `staff.test.${Date.now()}@lpu.edu.ph`,
          firstName: 'Staff',
          lastName: 'Test',
          role: 'staff' as const,
          status: 'active' as const,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `${Date.now()}-3`,
          email: `student.test.${Date.now()}@lpunetwork.edu.ph`,
          firstName: 'Student',
          lastName: 'Test',
          role: 'student' as const,
          status: 'pending' as const,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ]

      const existingUsers = JSON.parse(localStorage.getItem('demo-users') || '[]')
      const updatedUsers = [...existingUsers, ...testUsers]
      localStorage.setItem('demo-users', JSON.stringify(updatedUsers))
      
      console.log('🔍 DEBUG: Multiple test users created:', testUsers)
      console.log('🔍 DEBUG: Total users:', updatedUsers.length)
      alert(`${testUsers.length} test users created successfully! Total users: ${updatedUsers.length}`)
    } catch (error) {
      console.error('Error creating test users:', error)
      alert('Error creating test users')
    } finally {
      setLoading(false)
    }
  }

  const checkUsersLocalStorage = () => {
    try {
      const users = JSON.parse(localStorage.getItem('demo-users') || '[]')
      console.log('🔍 DEBUG: Users localStorage content:', users)
      alert(`Found ${users.length} users in localStorage. Check console for details.`)
    } catch (error) {
      console.error('Error reading users localStorage:', error)
      alert('Error reading users localStorage')
    }
  }

  const clearUsersLocalStorage = () => {
    if (confirm('Are you sure you want to clear all users data?')) {
      try {
        localStorage.removeItem('demo-users')
        console.log('🔍 DEBUG: Users localStorage cleared')
        alert('Users localStorage cleared successfully')
      } catch (error) {
        console.error('Error clearing users localStorage:', error)
        alert('Error clearing users localStorage')
      }
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users Debug Tools</h1>
        <p className="text-gray-600 mt-2">Test localStorage persistence for Users Management</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={createTestUser}
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Single Test User'}
          </button>
          
          <button
            onClick={createMultipleTestUsers}
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Multiple Test Users'}
          </button>
          
          <button
            onClick={checkUsersLocalStorage}
            className="btn-secondary"
          >
            Check Users localStorage
          </button>
          
          <button
            onClick={clearUsersLocalStorage}
            className="btn-secondary bg-red-50 text-red-600 hover:bg-red-100"
          >
            Clear Users localStorage
          </button>
          
          <button
            onClick={() => router.push('/admin/users')}
            className="btn-secondary"
          >
            Go to Users Management
          </button>
          
          <button
            onClick={() => router.push('/admin/debug')}
            className="btn-secondary"
          >
            Back to Debug Dashboard
          </button>
        </div>
      </div>

      {/* Test Instructions */}
      <div className="mt-6 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Testing Instructions</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>1.</strong> Create test users using the buttons above</p>
          <p><strong>2.</strong> Navigate to Users Management to verify they appear</p>
          <p><strong>3.</strong> Refresh the page to test persistence</p>
          <p><strong>4.</strong> Check browser console for detailed debug logs</p>
          <p><strong>5.</strong> Use "Check localStorage" to inspect stored data</p>
        </div>
      </div>
    </div>
  )
}