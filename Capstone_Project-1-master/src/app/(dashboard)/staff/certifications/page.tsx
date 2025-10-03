'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Eye, Edit, Trash2, Users, Calendar, Award, CheckCircle, Clock, XCircle } from 'lucide-react'

interface Certification {
  id: string
  name: string
  description: string
  category: 'food_beverages' | 'front_office' | 'housekeeping' | 'tourism' | 'cookery'
  duration_hours: number
  prerequisites: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CertificationApplication {
  id: string
  student_id: string
  student_name: string
  student_email: string
  certification_id: string
  certification_name: string
  application_date: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  exam_date: string | null
  exam_score: number | null
  certificate_issued_date: string | null
  notes: string | null
}

// Mock data
const mockCertifications: Certification[] = [
  {
    id: '1',
    name: 'Food & Beverages Service NC II',
    description: 'Comprehensive training in food and beverage service operations',
    category: 'food_beverages',
    duration_hours: 320,
    prerequisites: ['Basic Food Safety', 'Customer Service Fundamentals'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Front Office Operations NC II',
    description: 'Training in hotel front office operations and guest services',
    category: 'front_office',
    duration_hours: 280,
    prerequisites: ['Communication Skills', 'Computer Literacy'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Housekeeping NC II',
    description: 'Professional housekeeping and accommodation services',
    category: 'housekeeping',
    duration_hours: 240,
    prerequisites: ['Basic Cleaning Techniques'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Tourism Promotion Services NC II',
    description: 'Tourism promotion and destination marketing',
    category: 'tourism',
    duration_hours: 300,
    prerequisites: ['Geography', 'Marketing Basics'],
    is_active: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Cookery NC II',
    description: 'Professional cooking and food preparation',
    category: 'cookery',
    duration_hours: 360,
    prerequisites: ['Food Safety', 'Basic Knife Skills'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

const mockApplications: CertificationApplication[] = [
  {
    id: '1',
    student_id: 'student1',
    student_name: 'Maria Santos',
    student_email: 'maria.santos@email.com',
    certification_id: '1',
    certification_name: 'Food & Beverages Service NC II',
    application_date: '2024-01-15T00:00:00Z',
    status: 'pending',
    exam_date: null,
    exam_score: null,
    certificate_issued_date: null,
    notes: null
  },
  {
    id: '2',
    student_id: 'student2',
    student_name: 'Juan Dela Cruz',
    student_email: 'juan.delacruz@email.com',
    certification_id: '2',
    certification_name: 'Front Office Operations NC II',
    application_date: '2024-01-10T00:00:00Z',
    status: 'approved',
    exam_date: '2024-02-15T00:00:00Z',
    exam_score: null,
    certificate_issued_date: null,
    notes: 'Prerequisites verified. Exam scheduled.'
  },
  {
    id: '3',
    student_id: 'student3',
    student_name: 'Ana Rodriguez',
    student_email: 'ana.rodriguez@email.com',
    certification_id: '3',
    certification_name: 'Housekeeping NC II',
    application_date: '2024-01-05T00:00:00Z',
    status: 'completed',
    exam_date: '2024-01-25T00:00:00Z',
    exam_score: 88,
    certificate_issued_date: '2024-01-30T00:00:00Z',
    notes: 'Excellent performance. Certificate issued.'
  },
  {
    id: '4',
    student_id: 'student4',
    student_name: 'Carlos Mendoza',
    student_email: 'carlos.mendoza@email.com',
    certification_id: '1',
    certification_name: 'Food & Beverages Service NC II',
    application_date: '2024-01-08T00:00:00Z',
    status: 'rejected',
    exam_date: null,
    exam_score: null,
    certificate_issued_date: null,
    notes: 'Prerequisites not met. Missing Food Safety certification.'
  }
]

const categoryLabels = {
  food_beverages: 'Food & Beverages',
  front_office: 'Front Office',
  housekeeping: 'Housekeeping',
  tourism: 'Tourism',
  cookery: 'Cookery'
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800'
}

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  completed: Award
}

export default function StaffCertificationsPage() {
  const [activeTab, setActiveTab] = useState<'certifications' | 'applications'>('certifications')
  const [certifications, setCertifications] = useState<Certification[]>(mockCertifications)
  const [applications, setApplications] = useState<CertificationApplication[]>(mockApplications)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Filter certifications
  const filteredCertifications = certifications.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || cert.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.certification_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.student_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  // Statistics
  const stats = {
    totalCertifications: certifications.length,
    activeCertifications: certifications.filter(c => c.is_active).length,
    totalApplications: applications.length,
    pendingApplications: applications.filter(a => a.status === 'pending').length,
    approvedApplications: applications.filter(a => a.status === 'approved').length,
    completedApplications: applications.filter(a => a.status === 'completed').length
  }

  const handleStatusUpdate = async (applicationId: string, newStatus: CertificationApplication['status'], notes?: string) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus, notes: notes || app.notes }
          : app
      )
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certification Management</h1>
          <p className="text-gray-600 mt-1">Manage TESDA certifications and student applications</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Certification</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Certifications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCertifications}</p>
            </div>
            <Award className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Certifications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCertifications}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedApplications}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('certifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'certifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Certifications ({stats.totalCertifications})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Applications ({stats.totalApplications})
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={activeTab === 'certifications' ? 'Search certifications...' : 'Search applications...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {activeTab === 'certifications' ? (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            ) : (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'certifications' ? (
            <div className="space-y-4">
              {filteredCertifications.map((certification) => (
                <div key={certification.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{certification.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          certification.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {certification.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {categoryLabels[certification.category]}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2">{certification.description}</p>
                      <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{certification.duration_hours} hours</span>
                        </span>
                        <span>Prerequisites: {certification.prerequisites.length}</span>
                        <span>Created: {formatDate(certification.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => {
                const StatusIcon = statusIcons[application.status]
                return (
                  <div key={application.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">{application.student_name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusColors[application.status]}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span className="capitalize">{application.status}</span>
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{application.certification_name}</p>
                        <p className="text-sm text-gray-500">{application.student_email}</p>
                        <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                          <span>Applied: {formatDate(application.application_date)}</span>
                          {application.exam_date && (
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Exam: {formatDate(application.exam_date)}</span>
                            </span>
                          )}
                          {application.exam_score && (
                            <span>Score: {application.exam_score}%</span>
                          )}
                        </div>
                        {application.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">"{application.notes}"</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {application.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusUpdate(application.id, 'approved', 'Application approved by staff')}
                              className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(application.id, 'rejected', 'Application rejected')}
                              className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}