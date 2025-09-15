'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CertificationsDebugPage(): JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const createTestCertification = async () => {
    setLoading(true)
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
      console.log('🔍 DEBUG: All certifications:', updatedCertifications)
      alert(`Test certification created successfully! Total certifications: ${updatedCertifications.length}`)
    } catch (error) {
      console.error('Error creating test certification:', error)
      alert('Error creating test certification')
    } finally {
      setLoading(false)
    }
  }

  const createTestApplication = async () => {
    setLoading(true)
    try {
      const testApplication = {
        id: Date.now().toString(),
        student_name: `Test Student ${Date.now()}`,
        student_email: `test.student.${Date.now()}@lpunetwork.edu.ph`,
        certification_name: 'Food & Beverages Services NC II',
        status: 'pending' as const,
        application_date: new Date().toISOString().split('T')[0],
        progress: 0
      }

      const existingApplications = JSON.parse(localStorage.getItem('demo-cert-applications') || '[]')
      const updatedApplications = [...existingApplications, testApplication]
      localStorage.setItem('demo-cert-applications', JSON.stringify(updatedApplications))
      
      console.log('🔍 DEBUG: Test application created:', testApplication)
      console.log('🔍 DEBUG: Total applications:', updatedApplications.length)
      console.log('🔍 DEBUG: All applications:', updatedApplications)
      alert(`Test application created successfully! Total applications: ${updatedApplications.length}`)
    } catch (error) {
      console.error('Error creating test application:', error)
      alert('Error creating test application')
    } finally {
      setLoading(false)
    }
  }

  const createMultipleTestCertifications = async () => {
    setLoading(true)
    try {
      const testCertifications = [
        {
          id: `${Date.now()}-1`,
          name: 'Housekeeping Services NC II',
          code: 'HK-NCII',
          description: 'National Certificate II in Housekeeping Services.',
          type: 'housekeeping' as const,
          duration_hours: 240,
          prerequisites: ['Basic Cleaning'],
          is_active: true,
          created_at: new Date().toISOString().split('T')[0],
          applications_count: 2,
          completions_count: 1
        },
        {
          id: `${Date.now()}-2`,
          name: 'Front Office Services NC II',
          code: 'FO-NCII',
          description: 'National Certificate II in Front Office Services.',
          type: 'front_office' as const,
          duration_hours: 300,
          prerequisites: ['Customer Service'],
          is_active: true,
          created_at: new Date().toISOString().split('T')[0],
          applications_count: 4,
          completions_count: 2
        },
        {
          id: `${Date.now()}-3`,
          name: 'Cookery NC III',
          code: 'COOK-NCIII',
          description: 'National Certificate III in Cookery.',
          type: 'cookery' as const,
          duration_hours: 400,
          prerequisites: ['Basic Cooking', 'Food Safety'],
          is_active: false,
          created_at: new Date().toISOString().split('T')[0],
          applications_count: 1,
          completions_count: 0
        }
      ]

      const existingCertifications = JSON.parse(localStorage.getItem('demo-certifications') || '[]')
      const updatedCertifications = [...existingCertifications, ...testCertifications]
      localStorage.setItem('demo-certifications', JSON.stringify(updatedCertifications))
      
      console.log('🔍 DEBUG: Multiple test certifications created:', testCertifications)
      console.log('🔍 DEBUG: Total certifications:', updatedCertifications.length)
      alert(`${testCertifications.length} test certifications created successfully! Total: ${updatedCertifications.length}`)
    } catch (error) {
      console.error('Error creating test certifications:', error)
      alert('Error creating test certifications')
    } finally {
      setLoading(false)
    }
  }

  const checkCertificationsLocalStorage = () => {
    try {
      const certifications = JSON.parse(localStorage.getItem('demo-certifications') || '[]')
      const applications = JSON.parse(localStorage.getItem('demo-cert-applications') || '[]')
      
      console.log('🔍 DEBUG: Certifications localStorage content:', certifications)
      console.log('🔍 DEBUG: Applications localStorage content:', applications)
      
      alert(`Found ${certifications.length} certifications and ${applications.length} applications in localStorage. Check console for details.`)
    } catch (error) {
      console.error('Error reading certifications localStorage:', error)
      alert('Error reading certifications localStorage')
    }
  }

  const clearCertificationsLocalStorage = () => {
    if (confirm('Are you sure you want to clear all certifications data?')) {
      try {
        localStorage.removeItem('demo-certifications')
        localStorage.removeItem('demo-cert-applications')
        console.log('🔍 DEBUG: Certifications localStorage cleared')
        alert('Certifications localStorage cleared successfully')
      } catch (error) {
        console.error('Error clearing certifications localStorage:', error)
        alert('Error clearing certifications localStorage')
      }
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Certifications Debug Tools</h1>
        <p className="text-gray-600 mt-2">Test localStorage persistence for Certifications Management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certifications Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Certifications</h3>
          <div className="space-y-3">
            <button
              onClick={createTestCertification}
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Single Test Certification'}
            </button>
            
            <button
              onClick={createMultipleTestCertifications}
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Multiple Test Certifications'}
            </button>
          </div>
        </div>

        {/* Applications Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Applications</h3>
          <div className="space-y-3">
            <button
              onClick={createTestApplication}
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Test Application'}
            </button>
          </div>
        </div>
      </div>

      {/* Global Actions */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={checkCertificationsLocalStorage}
            className="btn-secondary"
          >
            Check localStorage
          </button>
          
          <button
            onClick={clearCertificationsLocalStorage}
            className="btn-secondary bg-red-50 text-red-600 hover:bg-red-100"
          >
            Clear localStorage
          </button>
          
          <button
            onClick={() => router.push('/admin/certifications')}
            className="btn-secondary"
          >
            Go to Certifications
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
          <p><strong>1.</strong> Create test certifications and applications using the buttons above</p>
          <p><strong>2.</strong> Navigate to Certifications Management to verify they appear</p>
          <p><strong>3.</strong> Switch between "Certifications" and "Applications" tabs</p>
          <p><strong>4.</strong> Refresh the page to test persistence</p>
          <p><strong>5.</strong> Check browser console for detailed debug logs</p>
          <p><strong>6.</strong> Test status changes on applications (approve/reject)</p>
        </div>
      </div>
    </div>
  )
}