'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/supabase-client'

interface Invitation {
  id: string
  email: string
  role: 'admin' | 'staff' | 'student'
  code: string
  status: 'pending' | 'accepted' | 'expired'
  sent_at: string
  expires_at: string
  invited_by: string
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newInvitation, setNewInvitation] = useState({
    email: '',
    role: 'student' as 'admin' | 'staff' | 'student'
  })

  // Fetch invitations from Supabase
  const fetchInvitations = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .order('sent_at', { ascending: false })
    if (error) {
      setInvitations([])
    } else {
      setInvitations(data as Invitation[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchInvitations()
    // eslint-disable-next-line
  }, [])

  // Send new invitation via API
  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/send-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newInvitation.email,
          role: newInvitation.role,
          invitedBy: 'admin@lpu.edu.ph'
        })
      })
      const data = await res.json()
      if (res.ok) {
        alert('Invitation sent successfully!')
        setShowCreateForm(false)
        setNewInvitation({ email: '', role: 'student' })
        await fetchInvitations()
      } else {
        alert('Failed to send invitation: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Failed to send invitation')
    }
    setLoading(false)
  }

  // Revoke invitation (set status to expired)
  const handleRevokeInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to revoke this invitation? This action cannot be undone.')) return
    setLoading(true)
    await supabase
      .from('invitations')
      .update({ status: 'expired' })
      .eq('id', invitationId)
    await fetchInvitations()
    setLoading(false)
    alert('Invitation revoked successfully!')
  }

  // Resend invitation: call API to resend email, then update status/timestamps in Supabase
  const handleResendInvitation = async (invitationId: string) => {
    setLoading(true)
    const invitation = invitations.find(inv => inv.id === invitationId)
    if (!invitation) {
      alert('Invitation not found.')
      setLoading(false)
      return
    }
    // Call API to resend invitation email
    const res = await fetch('/api/send-invitation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: invitation.email,
        role: invitation.role,
        invitedBy: invitation.invited_by
      })
    })
    const data = await res.json()
    if (res.ok) {
      // Update status and timestamps in Supabase
      const newExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      await supabase
        .from('invitations')
        .update({
          status: 'pending',
          sent_at: new Date().toISOString(),
          expires_at: newExpires
        })
        .eq('id', invitationId)
      await fetchInvitations()
      alert('Invitation resent successfully!')
    } else {
      alert('Failed to resend invitation: ' + (data.error || 'Unknown error'))
    }
    setLoading(false)
  }

  // Delete invitation
  const handleDeleteInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to permanently delete this invitation? This action cannot be undone.')) return
    setLoading(true)
    await supabase
      .from('invitations')
      .delete()
      .eq('id', invitationId)
    await fetchInvitations()
    setLoading(false)
    alert('Invitation deleted successfully!')
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
                    {invitation.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invitation.status)}`}>
                      {invitation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invitation.sent_at ? new Date(invitation.sent_at).toLocaleDateString() : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invitation.expires_at ? new Date(invitation.expires_at).toLocaleDateString() : ''}
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