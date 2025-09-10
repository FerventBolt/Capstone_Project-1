'use client'

import { useState, useEffect } from 'react'

interface Invitation {
  id: string
  email: string
  role: 'admin' | 'staff' | 'student'
  invitationCode: string
  status: 'pending' | 'accepted' | 'expired'
  sentAt: string
  expiresAt: string
  sentBy: string
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newInvitation, setNewInvitation] = useState({
    email: '',
    role: 'student' as 'admin' | 'staff' | 'student'
  })

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        console.log('🔍 DEBUG: Fetching invitations from localStorage...')
        
        // Get invitations from localStorage
        let storedInvitations = []
        try {
          const invitationData = localStorage.getItem('demo-invitations')
          if (invitationData) {
            storedInvitations = JSON.parse(invitationData)
            console.log('🔍 DEBUG: Found invitations in localStorage:', storedInvitations.length)
          }
        } catch (storageError) {
          console.error('🔍 DEBUG: Error reading invitations from localStorage:', storageError)
        }
        
        // Add minimal default invitation if none exist
        if (storedInvitations.length === 0) {
          storedInvitations = [
            {
              id: '1',
              email: 'demo@lpunetwork.edu.ph',
              role: 'student',
              invitationCode: 'DEMO001',
              status: 'pending',
              sentAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              sentBy: 'admin@lpu.edu.ph'
            }
          ]
          console.log('🔍 DEBUG: Added minimal default invitation')
        }
        
        setInvitations(storedInvitations)
      } catch (error) {
        console.error('Error fetching invitations:', error)
        setInvitations([])
      } finally {
        setLoading(false)
      }
    }

    fetchInvitations()
  }, [])

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log('🔍 DEBUG: Creating invitation:', newInvitation)
      
      // Create new invitation
      const invitation: Invitation = {
        id: Date.now().toString(),
        email: newInvitation.email,
        role: newInvitation.role,
        invitationCode: `INV${Date.now()}`,
        status: 'pending',
        sentAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        sentBy: 'admin@lpu.edu.ph'
      }
      
      // Update state
      const updatedInvitations = [invitation, ...invitations]
      setInvitations(updatedInvitations)
      
      // Save to localStorage
      try {
        localStorage.setItem('demo-invitations', JSON.stringify(updatedInvitations))
        console.log('🔍 DEBUG: Invitation saved to localStorage')
      } catch (storageError) {
        console.error('🔍 DEBUG: Error saving invitation to localStorage:', storageError)
      }
      
      setNewInvitation({ email: '', role: 'student' })
      setShowCreateForm(false)
      
      alert('Invitation sent successfully!')
    } catch (error) {
      console.error('Error creating invitation:', error)
      alert('Failed to send invitation')
    }
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to revoke this invitation? This action cannot be undone.')) {
      return
    }

    try {
      console.log('🔍 DEBUG: Revoking invitation:', invitationId)
      
      // Update the invitation status to expired
      const updatedInvitations = invitations.map(invitation =>
        invitation.id === invitationId
          ? { ...invitation, status: 'expired' as const }
          : invitation
      )
      
      setInvitations(updatedInvitations)
      
      // Save to localStorage
      try {
        localStorage.setItem('demo-invitations', JSON.stringify(updatedInvitations))
        console.log('🔍 DEBUG: Revoked invitation saved to localStorage')
      } catch (storageError) {
        console.error('🔍 DEBUG: Error saving revoked invitation to localStorage:', storageError)
      }
      
      alert('Invitation revoked successfully!')
    } catch (error) {
      console.error('Error revoking invitation:', error)
      alert('Failed to revoke invitation')
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      console.log('🔍 DEBUG: Resending invitation:', invitationId)
      
      // Update the invitation with new expiry date and reset to pending
      const updatedInvitations = invitations.map(invitation =>
        invitation.id === invitationId
          ? {
              ...invitation,
              status: 'pending' as const,
              sentAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              invitationCode: `INV${Date.now()}`
            }
          : invitation
      )
      
      setInvitations(updatedInvitations)
      
      // Save to localStorage
      try {
        localStorage.setItem('demo-invitations', JSON.stringify(updatedInvitations))
        console.log('🔍 DEBUG: Resent invitation saved to localStorage')
      } catch (storageError) {
        console.error('🔍 DEBUG: Error saving resent invitation to localStorage:', storageError)
      }
      
      alert('Invitation resent successfully!')
    } catch (error) {
      console.error('Error resending invitation:', error)
      alert('Failed to resend invitation')
    }
  }

  const handleDeleteInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to permanently delete this invitation? This action cannot be undone.')) {
      return
    }

    try {
      console.log('🔍 DEBUG: Deleting invitation:', invitationId)
      
      // Remove the invitation from the list
      const updatedInvitations = invitations.filter(invitation => invitation.id !== invitationId)
      
      setInvitations(updatedInvitations)
      
      // Save to localStorage
      try {
        localStorage.setItem('demo-invitations', JSON.stringify(updatedInvitations))
        console.log('🔍 DEBUG: Deleted invitation saved to localStorage')
      } catch (storageError) {
        console.error('🔍 DEBUG: Error saving after deletion to localStorage:', storageError)
      }
      
      alert('Invitation deleted successfully!')
    } catch (error) {
      console.error('Error deleting invitation:', error)
      alert('Failed to delete invitation')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'staff': return 'bg-blue-100 text-blue-800'
      case 'student': return 'bg-green-100 text-green-800'
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
            <h1 className="text-3xl font-bold text-gray-900">User Invitations</h1>
            <p className="text-gray-600 mt-2">Send invitations to new users</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Send New Invitation
          </button>
        </div>
      </div>

      {/* Create Invitation Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send New Invitation</h3>
            <form onSubmit={handleCreateInvitation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newInvitation.email}
                  onChange={(e) => setNewInvitation(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field"
                  placeholder="user@lpu.edu.ph or user@lpunetwork.edu.ph"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={newInvitation.role}
                  onChange={(e) => setNewInvitation(prev => ({ ...prev, role: e.target.value as 'admin' | 'staff' | 'student' }))}
                  className="input-field"
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Send Invitation
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

      {/* Invitations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Invitations ({invitations.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invitations.map((invitation) => (
                <tr key={invitation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invitation.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(invitation.role)}`}>
                      {invitation.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {invitation.invitationCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invitation.status)}`}>
                      {invitation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invitation.sentAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {invitation.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleResendInvitation(invitation.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Resend
                          </button>
                          <button
                            onClick={() => handleRevokeInvitation(invitation.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Revoke
                          </button>
                        </>
                      )}
                      {invitation.status === 'expired' && (
                        <button
                          onClick={() => handleResendInvitation(invitation.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Resend
                        </button>
                      )}
                      {(invitation.status === 'expired' || invitation.status === 'accepted') && (
                        <button
                          onClick={() => handleDeleteInvitation(invitation.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}