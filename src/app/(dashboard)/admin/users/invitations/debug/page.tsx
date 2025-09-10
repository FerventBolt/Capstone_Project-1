'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InvitationsDebugPage(): JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const createTestInvitation = async () => {
    setLoading(true)
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
      console.log('🔍 DEBUG: All invitations:', updatedInvitations)
      alert(`Test invitation created successfully! Total invitations: ${updatedInvitations.length}`)
    } catch (error) {
      console.error('Error creating test invitation:', error)
      alert('Error creating test invitation')
    } finally {
      setLoading(false)
    }
  }

  const createMultipleTestInvitations = async () => {
    setLoading(true)
    try {
      const testInvitations = [
        {
          id: `${Date.now()}-1`,
          email: `admin.invite.${Date.now()}@lpu.edu.ph`,
          role: 'admin' as const,
          invitationCode: `ADM${Date.now()}`,
          status: 'pending' as const,
          sentAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          sentBy: 'admin@lpu.edu.ph'
        },
        {
          id: `${Date.now()}-2`,
          email: `staff.invite.${Date.now()}@lpu.edu.ph`,
          role: 'staff' as const,
          invitationCode: `STF${Date.now()}`,
          status: 'pending' as const,
          sentAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          sentBy: 'admin@lpu.edu.ph'
        },
        {
          id: `${Date.now()}-3`,
          email: `student.invite.${Date.now()}@lpunetwork.edu.ph`,
          role: 'student' as const,
          invitationCode: `STU${Date.now()}`,
          status: 'accepted' as const,
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          sentBy: 'admin@lpu.edu.ph'
        },
        {
          id: `${Date.now()}-4`,
          email: `expired.invite.${Date.now()}@lpunetwork.edu.ph`,
          role: 'student' as const,
          invitationCode: `EXP${Date.now()}`,
          status: 'expired' as const,
          sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          sentBy: 'admin@lpu.edu.ph'
        }
      ]

      const existingInvitations = JSON.parse(localStorage.getItem('demo-invitations') || '[]')
      const updatedInvitations = [...testInvitations, ...existingInvitations]
      localStorage.setItem('demo-invitations', JSON.stringify(updatedInvitations))
      
      console.log('🔍 DEBUG: Multiple test invitations created:', testInvitations)
      console.log('🔍 DEBUG: Total invitations:', updatedInvitations.length)
      alert(`${testInvitations.length} test invitations created successfully! Total: ${updatedInvitations.length}`)
    } catch (error) {
      console.error('Error creating test invitations:', error)
      alert('Error creating test invitations')
    } finally {
      setLoading(false)
    }
  }

  const simulateInvitationStatusChanges = async () => {
    setLoading(true)
    try {
      const invitations = JSON.parse(localStorage.getItem('demo-invitations') || '[]')
      
      if (invitations.length === 0) {
        alert('No invitations found. Create some test invitations first.')
        return
      }

      // Update some invitation statuses
      const updatedInvitations = invitations.map((invitation: any, index: number) => {
        if (index === 0 && invitation.status === 'pending') {
          return { ...invitation, status: 'accepted' }
        }
        if (index === 1 && invitation.status === 'pending') {
          return { ...invitation, status: 'expired' }
        }
        return invitation
      })

      localStorage.setItem('demo-invitations', JSON.stringify(updatedInvitations))
      
      console.log('🔍 DEBUG: Invitation statuses updated:', updatedInvitations)
      alert('Invitation statuses updated successfully!')
    } catch (error) {
      console.error('Error updating invitation statuses:', error)
      alert('Error updating invitation statuses')
    } finally {
      setLoading(false)
    }
  }

  const checkInvitationsLocalStorage = () => {
    try {
      const invitations = JSON.parse(localStorage.getItem('demo-invitations') || '[]')
      console.log('🔍 DEBUG: Invitations localStorage content:', invitations)
      
      const statusCounts = invitations.reduce((acc: any, inv: any) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1
        return acc
      }, {})
      
      console.log('🔍 DEBUG: Invitation status counts:', statusCounts)
      alert(`Found ${invitations.length} invitations in localStorage. Status breakdown: ${JSON.stringify(statusCounts)}. Check console for details.`)
    } catch (error) {
      console.error('Error reading invitations localStorage:', error)
      alert('Error reading invitations localStorage')
    }
  }

  const clearInvitationsLocalStorage = () => {
    if (confirm('Are you sure you want to clear all invitations data?')) {
      try {
        localStorage.removeItem('demo-invitations')
        console.log('🔍 DEBUG: Invitations localStorage cleared')
        alert('Invitations localStorage cleared successfully')
      } catch (error) {
        console.error('Error clearing invitations localStorage:', error)
        alert('Error clearing invitations localStorage')
      }
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invitations Debug Tools</h1>
        <p className="text-gray-600 mt-2">Test localStorage persistence for User Invitations</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={createTestInvitation}
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Single Test Invitation'}
          </button>
          
          <button
            onClick={createMultipleTestInvitations}
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Multiple Test Invitations'}
          </button>
          
          <button
            onClick={simulateInvitationStatusChanges}
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Simulate Status Changes'}
          </button>
          
          <button
            onClick={checkInvitationsLocalStorage}
            className="btn-secondary"
          >
            Check Invitations localStorage
          </button>
          
          <button
            onClick={clearInvitationsLocalStorage}
            className="btn-secondary bg-red-50 text-red-600 hover:bg-red-100"
          >
            Clear Invitations localStorage
          </button>
          
          <button
            onClick={() => router.push('/admin/users/invitations')}
            className="btn-secondary"
          >
            Go to Invitations
          </button>
          
          <button
            onClick={() => router.push('/admin/users/debug')}
            className="btn-secondary"
          >
            Go to Users Debug
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
          <p><strong>1.</strong> Create test invitations using the buttons above</p>
          <p><strong>2.</strong> Navigate to User Invitations to verify they appear</p>
          <p><strong>3.</strong> Test the invitation form by creating new invitations manually</p>
          <p><strong>4.</strong> Use "Simulate Status Changes" to test different invitation states</p>
          <p><strong>5.</strong> Refresh the page to test persistence</p>
          <p><strong>6.</strong> Check browser console for detailed debug logs</p>
          <p><strong>7.</strong> Test resend/revoke functionality on pending invitations</p>
        </div>
      </div>

      {/* Status Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invitation Status Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">pending</span>
            <span>Invitation sent, awaiting response</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">accepted</span>
            <span>User has accepted and registered</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">expired</span>
            <span>Invitation has expired</span>
          </div>
        </div>
      </div>
    </div>
  )
}