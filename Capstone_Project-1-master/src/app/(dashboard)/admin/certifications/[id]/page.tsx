'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import NextLink from 'next/link'

// Fix for Next.js 14 Link component TypeScript issues
const Link = NextLink as any

interface Certification {
  id: string
  name: string
  code: string
  description: string
  type: 'food_beverages' | 'front_office' | 'housekeeping' | 'tourism' | 'cookery'
  duration_hours: number
  prerequisites: string[]
  is_active: boolean
  created_at: string
}

export default function EditCertificationPage() {
  const params = useParams()
  const router = useRouter()
  const [certification, setCertification] = useState<Certification | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchCertification = async () => {
      try {
        console.log('DEBUG: Fetching certification with ID:', params.id)
        
        // Mock data for now - replace with actual Supabase call
        const mockCertification: Certification = {
          id: params.id as string,
          name: 'Food & Beverages Services NC II',
          code: 'FBS-NCII',
          description: 'National Certificate II in Food & Beverages Services covering restaurant service, bar operations, and customer service skills.',
          type: 'food_beverages',
          duration_hours: 320,
          prerequisites: ['Basic Food Safety', 'Customer Service Fundamentals'],
          is_active: true,
          created_at: '2023-01-15'
        }
        
        setCertification(mockCertification)
      } catch (error) {
        console.error('Error fetching certification:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCertification()
    }
  }, [params.id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!certification) return

    setSaving(true)
    try {
      console.log('DEBUG: Saving certification:', certification)
      // TODO: Implement Supabase update
      alert('Certification updated successfully!')
      router.push('/admin/certifications')
    } catch (error) {
      console.error('Error saving certification:', error)
      alert('Failed to save certification')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!certification) return
    
    if (confirm('Are you sure you want to delete this certification? This action cannot be undone.')) {
      try {
        console.log('DEBUG: Deleting certification:', certification.id)
        // TODO: Implement Supabase delete
        alert('Certification deleted successfully!')
        router.push('/admin/certifications')
      } catch (error) {
        console.error('Error deleting certification:', error)
        alert('Failed to delete certification')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!certification) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Certification Not Found</h1>
          <p className="text-gray-600 mb-6">The certification you're looking for doesn't exist.</p>
          <Link href="/admin/certifications" className="btn-primary">
            Back to Certifications
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Certification</h1>
            <p className="text-gray-600 mt-2">Update certification details and settings</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/admin/certifications" className="btn-secondary">
              Cancel
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certification Name
              </label>
              <input
                type="text"
                value={certification.name}
                onChange={(e) => setCertification({...certification, name: e.target.value})}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certification Code
              </label>
              <input
                type="text"
                value={certification.code}
                onChange={(e) => setCertification({...certification, code: e.target.value})}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={certification.description}
              onChange={(e) => setCertification({...certification, description: e.target.value})}
              rows={4}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={certification.type}
                onChange={(e) => setCertification({...certification, type: e.target.value as any})}
                className="input-field"
                required
              >
                <option value="food_beverages">Food & Beverages</option>
                <option value="front_office">Front Office</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="tourism">Tourism</option>
                <option value="cookery">Cookery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Hours)
              </label>
              <input
                type="number"
                value={certification.duration_hours}
                onChange={(e) => setCertification({...certification, duration_hours: parseInt(e.target.value)})}
                className="input-field"
                required
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prerequisites (one per line)
            </label>
            <textarea
              value={certification.prerequisites.join('\n')}
              onChange={(e) => setCertification({...certification, prerequisites: e.target.value.split('\n').filter(p => p.trim())})}
              rows={3}
              className="input-field"
              placeholder="Enter prerequisites, one per line"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={certification.is_active}
              onChange={(e) => setCertification({...certification, is_active: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Active (available for applications)
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}