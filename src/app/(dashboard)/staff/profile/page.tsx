'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Camera, Award, BookOpen, Users, Clock } from 'lucide-react'

interface StaffProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  department: string
  position: string
  employee_id: string
  hire_date: string
  bio: string
  specializations: string[]
  certifications: string[]
  profile_image?: string
  emergency_contact: {
    name: string
    relationship: string
    phone: string
  }
  teaching_stats: {
    total_courses: number
    total_students: number
    total_lessons: number
    avg_rating: number
  }
}

// Mock data
const mockProfile: StaffProfile = {
  id: '1',
  name: 'Staff User',
  email: 'instructor@lpu.edu.ph',
  phone: '+639123456789',
  address: 'Manila, Philippines',
  department: 'Hospitality Management',
  position: 'Senior Instructor',
  employee_id: 'LPU-STAFF-001',
  hire_date: '2022-08-15T00:00:00Z',
  bio: 'Experienced hospitality instructor with over 8 years in the industry. Specialized in restaurant operations, customer service, and food & beverage management.',
  specializations: ['Restaurant Service', 'Food & Beverage Operations', 'Customer Service', 'Hotel Operations'],
  certifications: ['TESDA Certified Trainer', 'Food Safety Manager', 'Hospitality Management Certificate'],
  emergency_contact: {
    name: 'Maria Santos',
    relationship: 'Spouse',
    phone: '+639987654321'
  },
  teaching_stats: {
    total_courses: 3,
    total_students: 85,
    total_lessons: 24,
    avg_rating: 4.8
  }
}

export default function StaffProfilePage() {
  const [profile, setProfile] = useState<StaffProfile>(mockProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<StaffProfile>(mockProfile)
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = () => {
    setEditedProfile(profile)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // TODO: Save to backend
      setProfile(editedProfile)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEmergencyContactChange = (field: string, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      emergency_contact: {
        ...prev.emergency_contact,
        [field]: value
      }
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const currentProfile = isEditing ? editedProfile : profile

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
        </div>
        <div className="flex space-x-3">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              {/*  - Lucide icon type issue with strict TypeScript */}
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center space-x-2"
              >
                {/*  - Lucide icon type issue with strict TypeScript */}
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
              >
                {/*  - Lucide icon type issue with strict TypeScript */}
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {currentProfile.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                    {/*  - Lucide icon type issue with strict TypeScript */}
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-1">{currentProfile.name}</h2>
              <p className="text-gray-600 mb-2">{currentProfile.position}</p>
              <p className="text-sm text-blue-600">{currentProfile.department}</p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-3">
                {/*  - Lucide icon type issue with strict TypeScript */}
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">{currentProfile.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                {/*  - Lucide icon type issue with strict TypeScript */}
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">{currentProfile.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                {/*  - Lucide icon type issue with strict TypeScript */}
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">{currentProfile.address}</span>
              </div>
              <div className="flex items-center space-x-3">
                {/*  - Lucide icon type issue with strict TypeScript */}
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Joined {formatDate(currentProfile.hire_date)}</span>
              </div>
            </div>
          </div>

          {/* Teaching Stats */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Teaching Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{profile.teaching_stats.total_courses}</p>
                <p className="text-sm text-gray-600">Courses</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{profile.teaching_stats.total_students}</p>
                <p className="text-sm text-gray-600">Students</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{profile.teaching_stats.total_lessons}</p>
                <p className="text-sm text-gray-600">Lessons</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{profile.teaching_stats.avg_rating}</p>
                <p className="text-sm text-gray-600">Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{currentProfile.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                <p className="text-gray-900">{currentProfile.employee_id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{currentProfile.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{currentProfile.phone}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{currentProfile.address}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{currentProfile.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <p className="text-gray-900">{currentProfile.department}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <p className="text-gray-900">{currentProfile.position}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date</label>
                <p className="text-gray-900">{formatDate(currentProfile.hire_date)}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
              <div className="flex flex-wrap gap-2">
                {currentProfile.specializations.map((spec, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
              <div className="flex flex-wrap gap-2">
                {currentProfile.certifications.map((cert, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.emergency_contact.name}
                    onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{currentProfile.emergency_contact.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.emergency_contact.relationship}
                    onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{currentProfile.emergency_contact.relationship}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.emergency_contact.phone}
                    onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{currentProfile.emergency_contact.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}