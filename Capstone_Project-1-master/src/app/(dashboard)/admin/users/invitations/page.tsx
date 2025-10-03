'use client'

import { useState, useEffect } from 'react'

interface Invitation {
  id: string
  email: string
  role: 'admin' | 'staff' | 'student'
  status: 'pending' | 'accepted' | 'expired'
  sent_at: string
  expires_at: string
  user_id: string | null
  accepted_at: string | null
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newInvitation, setNewInvitation] = useState({
    email: '',
    role: 'student' as 'admin' | 'staff' | 'student',
  })

  useEffect(() => {
    fetchInvitations()
  }, [])

  // ─── Fetch from your GET route ─────────────────────────────────────
  async function fetchInvitations() {
    setLoading(true)
    try {
      const res = await fetch('/api/invitations', {
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = (await res.json()) as Invitation[]
      setInvitations(data)
    } catch (err) {
      console.error('Failed to load invitations:', err)
      setInvitations([])
    } finally {
      setLoading(false)
    }
  }

  // ─── Create via POST /api/invite ─────────────────────────────────
  async function handleCreateInvitation(e: React.FormEvent) {
    e.preventDefault()
    if (!newInvitation.email.trim()) {
      alert('Please enter an email.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/invite', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newInvitation.email.trim(),
        role: newInvitation.role,
      }),
    })

    const json = await res.json()
    if (!res.ok) {
      alert('Failed to send invitation: ' + (json.error || res.statusText))
      setLoading(false)
      return
    }

    await fetchInvitations()
    setNewInvitation({ email: '', role: 'student' })
    setShowForm(false)
    setLoading(false)
  }

  // ─── Revoke via PATCH /api/invitations/[id] ──────────────────────
  async function handleRevoke(id: string) {
    if (!confirm('Revoke this invitation?')) return
    setLoading(true)
    const res = await fetch(`/api/invitations/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'expired' }),
    })
    if (!res.ok) {
      const err = await res.json()
      alert('Failed to revoke: ' + (err.error || res.statusText))
    }
    await fetchInvitations()
    setLoading(false)
  }

  // ─── Delete via DELETE /api/invitations/[id] ─────────────────────
  async function handleDelete(id: string) {
    if (!confirm('Permanently delete this invitation?')) return
    setLoading(true)
    const res = await fetch(`/api/invitations/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    const json = await res.json()
    if (!res.ok) {
      alert(json.error || 'Failed to delete invitation')
    } else {
      await fetchInvitations()
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Invitations</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Send Invitation
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">New Invitation</h2>
            <form onSubmit={handleCreateInvitation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newInvitation.email}
                  onChange={e =>
                    setNewInvitation(p => ({ ...p, email: e.target.value }))
                  }
                  className="input-field w-full"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={newInvitation.role}
                  onChange={e =>
                    setNewInvitation(p => ({
                      ...p,
                      role: e.target.value as 'admin' | 'staff' | 'student',
                    }))
                  }
                  className="input-field w-full"
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                'Email',
                'Role',
                'Status',
                'Sent At',
                'Expires At',
                'User ID',
                'Accepted At',
                'Actions',
              ].map(col => (
                <th
                  key={col}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invitations.map(inv => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm">{inv.email}</td>
                <td className="px-4 py-2 text-sm">{inv.role}</td>
                <td className="px-4 py-2 text-sm">{inv.status}</td>
                <td className="px-4 py-2 text-sm">
                  {new Date(inv.sent_at).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm">
                  {new Date(inv.expires_at).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm">{inv.user_id ?? '-'}</td>
                <td className="px-4 py-2 text-sm">
                  {inv.accepted_at
                    ? new Date(inv.accepted_at).toLocaleString()
                    : '-'}
                </td>
                <td className="px-4 py-2 text-sm space-x-2">
                  {inv.status === 'pending' && (
                    <button
                      onClick={() => handleRevoke(inv.id)}
                      className="text-red-600 hover:underline"
                    >
                      Revoke
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(inv.id)}
                    className="text-gray-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
