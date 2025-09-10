'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'staff' | 'student'
  status: 'active' | 'inactive' | 'pending'
  lastLogin: string
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'student' as 'admin' | 'staff' | 'student',
    status: 'active' as 'active' | 'inactive' | 'pending'
  })

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('🔍 DEBUG: Fetching users from API and localStorage...')
        
        // Get default users from API
        const response = await fetch('/api/admin/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        let defaultUsers = []
        if (response.ok) {
          const result = await response.json()
          defaultUsers = result.users || []
          console.log('🔍 DEBUG: Successfully fetched default users:', defaultUsers.length)
        } else {
          console.error('🔍 DEBUG: Failed to fetch default users, using empty array')
        }
        
        // Get user-created users from localStorage
        let userCreatedUsers = []
        try {
          const storedUsers = localStorage.getItem('demo-users')
          if (storedUsers) {
            userCreatedUsers = JSON.parse(storedUsers)
            console.log('🔍 DEBUG: Found user-created users in localStorage:', userCreatedUsers.length)
          }
        } catch (storageError) {
          console.error('🔍 DEBUG: Error reading from localStorage:', storageError)
        }
        
        // Merge default users with user-created users
        const allUsers = [...defaultUsers, ...userCreatedUsers]
        console.log('🔍 DEBUG: Total users (default + user-created):', allUsers.length)
        
        setUsers(allUsers)
      } catch (error) {
        console.error('Error fetching users:', error)
        // Fallback: try to load from localStorage only
        try {
          const storedUsers = localStorage.getItem('demo-users')
          if (storedUsers) {
            const userUsers = JSON.parse(storedUsers)
            console.log('🔍 DEBUG: Fallback: loaded users from localStorage only:', userUsers.length)
            setUsers(userUsers)
          } else {
            setUsers([])
          }
        } catch (fallbackError) {
          console.error('🔍 DEBUG: Fallback also failed:', fallbackError)
          setUsers([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'staff': return 'bg-blue-100 text-blue-800'
      case 'student': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateUser = async (userData: Omit<User, 'id' | 'lastLogin' | 'createdAt'>) => {
    try {
      console.log('🔍 DEBUG: User creation attempted with data:', userData)
      
      // Call the API endpoint to create the user
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user')
      }

      console.log('🔍 DEBUG: User created successfully:', result.user)
      
      // Store the new user in localStorage
      try {
        const existingUsers = JSON.parse(localStorage.getItem('demo-users') || '[]')
        const updatedUsers = [...existingUsers, result.user]
        localStorage.setItem('demo-users', JSON.stringify(updatedUsers))
        console.log('🔍 DEBUG: User saved to localStorage, total users:', updatedUsers.length)
      } catch (storageError) {
        console.error('🔍 DEBUG: Error saving to localStorage:', storageError)
      }
      
      // Update state
      const updatedUsers = [...users, result.user]
      setUsers(updatedUsers)
      
      alert('User created successfully!')
      return result.user
    } catch (error) {
      console.error('Error creating user:', error)
      alert(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }

  const handleUpdateUser = async (userData: User) => {
    try {
      console.log('🔍 DEBUG: User update attempted with data:', userData)
      
      // Call the API endpoint to update the user
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user')
      }

      console.log('🔍 DEBUG: User updated successfully:', result.user)
      
      // Update localStorage - only save user-created users
      try {
        const updatedUsers = users.map(user =>
          user.id === userData.id ? result.user : user
        )
        const userCreatedUsers = updatedUsers.filter(user =>
          !['1', '2'].includes(user.id) // Exclude default users
        )
        localStorage.setItem('demo-users', JSON.stringify(userCreatedUsers))
        console.log('🔍 DEBUG: User update saved to localStorage')
      } catch (storageError) {
        console.error('🔍 DEBUG: Error saving user update to localStorage:', storageError)
      }
      
      // Update state
      const updatedUsers = users.map(user =>
        user.id === userData.id ? result.user : user
      )
      setUsers(updatedUsers)
      
      alert('User updated successfully!')
      return result.user
    } catch (error) {
      console.error('Error updating user:', error)
      alert(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        console.log('🔍 DEBUG: User deletion attempted for ID:', userId)
        
        // Call the API endpoint to delete the user
        const response = await fetch(`/api/admin/users?id=${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to delete user')
        }

        console.log('🔍 DEBUG: User deleted successfully:', userId)
        
        // Update localStorage - only save user-created users
        try {
          const updatedUsers = users.filter(user => user.id !== userId)
          const userCreatedUsers = updatedUsers.filter(user =>
            !['1', '2'].includes(user.id) // Exclude default users
          )
          localStorage.setItem('demo-users', JSON.stringify(userCreatedUsers))
          console.log('🔍 DEBUG: User deletion saved to localStorage')
        } catch (storageError) {
          console.error('🔍 DEBUG: Error saving user deletion to localStorage:', storageError)
        }
        
        // Update state
        const updatedUsers = users.filter(user => user.id !== userId)
        setUsers(updatedUsers)
        
        alert('User deleted successfully!')
      } catch (error) {
        console.error('Error deleting user:', error)
        alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await handleCreateUser(newUser)
      setNewUser({
        email: '',
        firstName: '',
        lastName: '',
        role: 'student',
        status: 'active'
      })
      setShowCreateForm(false)
    } catch (error) {
      // Error already handled in handleCreateUser
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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage all users in the system</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create New User
            </button>
            <Link
              href="/admin/users/invitations"
              className="btn-secondary"
            >
              Send Invitations
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="input-field"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Users ({filteredUsers.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          console.log('DEBUG: Edit user button clicked for user:', user.id)
                          // For now, just show an alert with edit functionality
                          const newFirstName = prompt('Enter new first name:', user.firstName)
                          const newLastName = prompt('Enter new last name:', user.lastName)
                          if (newFirstName && newLastName) {
                            handleUpdateUser({
                              ...user,
                              firstName: newFirstName,
                              lastName: newLastName
                            })
                          }
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          console.log('DEBUG: View details button clicked for user:', user.id)
                          window.location.href = `/admin/users/${user.id}`
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New User</h3>
            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field"
                  placeholder="user@lpu.edu.ph or user@lpunetwork.edu.ph"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={newUser.firstName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                  className="input-field"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={newUser.lastName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                  className="input-field"
                  placeholder="Last Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'admin' | 'staff' | 'student' }))}
                  className="input-field"
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={newUser.status}
                  onChange={(e) => setNewUser(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'pending' }))}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}