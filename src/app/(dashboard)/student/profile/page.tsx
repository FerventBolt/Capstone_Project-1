'use client'

import { useState, useEffect } from 'react'

interface StudentProfile {
  id: string
  student_id: string
  first_name: string
  last_name: string
  middle_name?: string
  email: string
  phone_number?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  address?: string
  profile_picture_url?: string
  program?: string
  year_level?: number
  section?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  created_at: string
  updated_at: string
}

interface ProfileStats {
  courses_enrolled: number
  courses_completed: number
  certificates_submitted: number
  certificates_approved: number
  total_study_hours: number
  current_gpa: number
}

export default function StudentProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<StudentProfile>>({})

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Mock data for student profile
        const mockProfile: StudentProfile = {
          id: 'student-1',
          student_id: 'STU-2024-001',
          first_name: 'Juan',
          last_name: 'Dela Cruz',
          middle_name: 'Santos',
          email: 'juan.delacruz@lpunetwork.edu.ph',
          phone_number: '+63 912 345 6789',
          date_of_birth: '2000-05-15',
          gender: 'male',
          address: '123 Main Street, Quezon City, Metro Manila',
          profile_picture_url: '/avatars/student-avatar.jpg',
          program: 'Hotel and Restaurant Management',
          year_level: 3,
          section: 'A',
          emergency_contact_name: 'Maria Dela Cruz',
          emergency_contact_phone: '+63 917 123 4567',
          emergency_contact_relationship: 'Mother',
          created_at: '2024-01-15',
          updated_at: '2024-01-20'
        }

        const mockStats: ProfileStats = {
          courses_enrolled: 4,
          courses_completed: 1,
          certificates_submitted: 3,
          certificates_approved: 1,
          total_study_hours: 120,
          current_gpa: 3.75
        }

        setProfile(mockProfile)
        setStats(mockStats)
        setEditForm(mockProfile)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    if (profile) {
      setEditForm(profile)
    }
  }

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement API call to update profile
      console.log('Updating profile:', editForm)
      
      // Mock update
      if (profile) {
        const updatedProfile = { ...profile, ...editForm, updated_at: new Date().toISOString().split('T')[0] }
        setProfile(updatedProfile)
        setIsEditing(false)
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile. Please try again.')
    }
  }

  const handleInputChange = (field: keyof StudentProfile, value: string | number) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile not found</h3>
          <p className="text-gray-600">Unable to load your profile information.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your personal information and academic details.</p>
          </div>
          <button
            onClick={isEditing ? handleSaveProfile : handleEditToggle}
            className={`px-4 py-2 rounded-lg font-medium ${
              isEditing
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.first_name || ''}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.first_name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.last_name || ''}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.last_name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.middle_name || ''}
                    onChange={(e) => handleInputChange('middle_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.middle_name || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <p className="text-gray-900">{profile.student_id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{profile.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone_number || ''}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.phone_number || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editForm.date_of_birth || ''}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.date_of_birth || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                {isEditing ? (
                  <select
                    value={editForm.gender || ''}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-gray-900 capitalize">{profile.gender?.replace('_', ' ') || 'N/A'}</p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              {isEditing ? (
                <textarea
                  value={editForm.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              ) : (
                <p className="text-gray-900">{profile.address || 'N/A'}</p>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.program || ''}
                    onChange={(e) => handleInputChange('program', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.program || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
                {isEditing ? (
                  <select
                    value={editForm.year_level || ''}
                    onChange={(e) => handleInputChange('year_level', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profile.year_level ? `${profile.year_level}${profile.year_level === 1 ? 'st' : profile.year_level === 2 ? 'nd' : profile.year_level === 3 ? 'rd' : 'th'} Year` : 'N/A'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.section || ''}
                    onChange={(e) => handleInputChange('section', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.section || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.emergency_contact_name || ''}
                    onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.emergency_contact_name || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.emergency_contact_phone || ''}
                    onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.emergency_contact_phone || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.emergency_contact_relationship || ''}
                    onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.emergency_contact_relationship || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditForm(profile)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Profile Stats Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              {profile.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="text-4xl text-gray-400">👤</div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {profile.first_name} {profile.last_name}
            </h3>
            <p className="text-sm text-gray-600">{profile.student_id}</p>
            <p className="text-sm text-gray-600">{profile.program}</p>
          </div>

          {/* Academic Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Courses Enrolled:</span>
                <span className="font-medium">{stats.courses_enrolled}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Courses Completed:</span>
                <span className="font-medium">{stats.courses_completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Certificates Submitted:</span>
                <span className="font-medium">{stats.certificates_submitted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Certificates Approved:</span>
                <span className="font-medium">{stats.certificates_approved}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Study Hours:</span>
                <span className="font-medium">{stats.total_study_hours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current GPA:</span>
                <span className="font-medium">{stats.current_gpa}</span>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Info</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Member since:</span>
                <span className="ml-2 font-medium">{profile.created_at}</span>
              </div>
              <div>
                <span className="text-gray-600">Last updated:</span>
                <span className="ml-2 font-medium">{profile.updated_at}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}