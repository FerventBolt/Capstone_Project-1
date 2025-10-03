'use client'

import { useState, useEffect } from 'react'

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  createdAt: string
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    // TODO: Fetch real data from Supabase
    const fetchRolesAndPermissions = async () => {
      try {
        // Mock data for now
        setPermissions([
          { id: '1', name: 'user.create', description: 'Create new users', category: 'User Management' },
          { id: '2', name: 'user.read', description: 'View user information', category: 'User Management' },
          { id: '3', name: 'user.update', description: 'Update user information', category: 'User Management' },
          { id: '4', name: 'user.delete', description: 'Delete users', category: 'User Management' },
          { id: '5', name: 'course.create', description: 'Create new courses', category: 'Course Management' },
          { id: '6', name: 'course.read', description: 'View course information', category: 'Course Management' },
          { id: '7', name: 'course.update', description: 'Update course information', category: 'Course Management' },
          { id: '8', name: 'course.delete', description: 'Delete courses', category: 'Course Management' },
          { id: '9', name: 'certification.create', description: 'Create certifications', category: 'Certification Management' },
          { id: '10', name: 'certification.read', description: 'View certifications', category: 'Certification Management' },
          { id: '11', name: 'certification.approve', description: 'Approve certifications', category: 'Certification Management' },
          { id: '12', name: 'system.settings', description: 'Manage system settings', category: 'System Administration' },
          { id: '13', name: 'reports.view', description: 'View system reports', category: 'Reporting' }
        ])

        setRoles([
          {
            id: '1',
            name: 'Admin',
            description: 'Full system access with all permissions',
            permissions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
            userCount: 2,
            createdAt: '2024-01-01 09:00:00'
          },
          {
            id: '2',
            name: 'Staff',
            description: 'Course instructors with limited administrative access',
            permissions: ['2', '6', '7', '10', '13'],
            userCount: 15,
            createdAt: '2024-01-01 09:00:00'
          },
          {
            id: '3',
            name: 'Student',
            description: 'Basic user access for course enrollment and certification',
            permissions: ['2', '6', '10'],
            userCount: 1230,
            createdAt: '2024-01-01 09:00:00'
          }
        ])
      } catch (error) {
        console.error('Error fetching roles and permissions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRolesAndPermissions()
  }, [])

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {}
    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = []
      }
      categories[permission.category].push(permission)
    })
    return categories
  }

  const getPermissionName = (permissionId: string) => {
    const permission = permissions.find(p => p.id === permissionId)
    return permission ? permission.name : permissionId
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole({ ...role })
    setShowEditModal(true)
  }

  const handleSaveRole = async () => {
    if (!selectedRole) return
    
    try {
      // TODO: Implement Supabase role update
      console.log('Updating role:', selectedRole)
      
      // Mock update
      setRoles(prev => prev.map(role => 
        role.id === selectedRole.id ? selectedRole : role
      ))
      
      setShowEditModal(false)
      setSelectedRole(null)
      alert('Role updated successfully!')
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update role')
    }
  }

  const togglePermission = (permissionId: string) => {
    if (!selectedRole) return
    
    const hasPermission = selectedRole.permissions.includes(permissionId)
    setSelectedRole(prev => ({
      ...prev!,
      permissions: hasPermission
        ? prev!.permissions.filter(id => id !== permissionId)
        : [...prev!.permissions, permissionId]
    }))
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
        <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
        <p className="text-gray-600 mt-2">Manage user roles and their permissions</p>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
              <button
                onClick={() => handleEditRole(role)}
                className="text-blue-600 hover:text-blue-900 text-sm"
              >
                Edit
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">{role.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Users:</span>
                <span className="font-medium">{role.userCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Permissions:</span>
                <span className="font-medium">{role.permissions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created:</span>
                <span className="font-medium">{new Date(role.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Permissions</h3>
        </div>
        <div className="p-6">
          {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
            <div key={category} className="mb-6 last:mb-0">
              <h4 className="text-md font-medium text-gray-900 mb-3">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categoryPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                      <div className="text-xs text-gray-500">{permission.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Role Modal */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Role: {selectedRole.name}</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                <input
                  type="text"
                  value={selectedRole.name}
                  onChange={(e) => setSelectedRole(prev => ({ ...prev!, name: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={selectedRole.description}
                  onChange={(e) => setSelectedRole(prev => ({ ...prev!, description: e.target.value }))}
                  className="input-field"
                  rows={3}
                />
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Permissions</h4>
              {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
                <div key={category} className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">{category}</h5>
                  <div className="space-y-2">
                    {categoryPermissions.map((permission) => (
                      <label key={permission.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedRole.permissions.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                          <div className="text-xs text-gray-500">{permission.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <button onClick={handleSaveRole} className="btn-primary flex-1">
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedRole(null)
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