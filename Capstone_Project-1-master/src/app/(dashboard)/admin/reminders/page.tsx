'use client'

import { useState, useEffect } from 'react'

interface Reminder {
  id: string
  title: string
  message: string
  reminder_type: 'general' | 'announcement' | 'deadline' | 'maintenance' | 'course_update' | 'assignment' | 'exam' | 'event'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  target_audience: 'all_students' | 'specific_students' | 'specific_emails' | 'course_students' | 'all_users' | 'staff_only' | 'admin_only'
  target_user_ids: string[]
  target_course_ids: string[]
  target_emails: string[]
  is_active: boolean
  is_dismissible: boolean
  expires_at?: string
  created_at: string
  updated_at: string
  created_by_user: {
    id: string
    first_name: string
    last_name: string
    email: string
    role: string
  }
}

interface Course {
  id: string
  title: string
  code: string
}

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
}

export default function AdminRemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string>('')
  const [emailSearch, setEmailSearch] = useState('')
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    reminder_type: 'general' as 'general' | 'announcement' | 'deadline' | 'maintenance' | 'course_update' | 'assignment' | 'exam' | 'event',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    target_audience: 'all_students' as 'all_students' | 'specific_students' | 'specific_emails' | 'course_students' | 'all_users' | 'staff_only' | 'admin_only',
    target_user_ids: [] as string[],
    target_course_ids: [] as string[],
    target_emails: [] as string[],
    is_dismissible: true,
    expires_at: ''
  })

  useEffect(() => {
    fetchData()
    loadCurrentUserRole()
  }, [])

  const loadCurrentUserRole = () => {
    // Get current user role from localStorage or session
    const demoSession = localStorage.getItem('demo-session')
    if (demoSession) {
      try {
        const session = JSON.parse(demoSession)
        setCurrentUserRole(session.role || '')
      } catch (error) {
        console.error('Error parsing demo session:', error)
      }
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log('🔍 DEBUG: Fetching reminders from API and localStorage...')
      
      // Fetch default reminders from API
      let defaultReminders = []
      const remindersResponse = await fetch('/api/admin/reminders')
      if (remindersResponse.ok) {
        const remindersData = await remindersResponse.json()
        defaultReminders = remindersData.reminders || []
        console.log('🔍 DEBUG: Successfully fetched default reminders:', defaultReminders.length)
      } else {
        console.error('🔍 DEBUG: Failed to fetch default reminders, using empty array')
      }

      // Get user-created reminders from localStorage
      let userCreatedReminders = []
      try {
        const storedReminders = localStorage.getItem('demo-reminders')
        if (storedReminders) {
          userCreatedReminders = JSON.parse(storedReminders)
          console.log('🔍 DEBUG: Found user-created reminders in localStorage:', userCreatedReminders.length)
        }
      } catch (storageError) {
        console.error('🔍 DEBUG: Error reading reminders from localStorage:', storageError)
      }

      // Merge default reminders with user-created reminders
      const allReminders = [...defaultReminders, ...userCreatedReminders]
      console.log('🔍 DEBUG: Total reminders (default + user-created):', allReminders.length)
      setReminders(allReminders)

      // Fetch courses for targeting
      const coursesResponse = await fetch('/api/admin/courses')
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json()
        setCourses(coursesData.courses || [])
      }

      // Fetch users for targeting
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        // Filter users based on current user role
        let filteredUsers = usersData.users || []
        if (currentUserRole === 'staff') {
          // Staff can only target students
          filteredUsers = filteredUsers.filter((u: User) => u.role === 'student')
        } else if (currentUserRole === 'admin') {
          // Admin can target all users
          filteredUsers = usersData.users || []
        }
        setUsers(filteredUsers)
      }

    } catch (error) {
      console.error('Error fetching reminders:', error)
      // Fallback: try to load from localStorage only
      try {
        const storedReminders = localStorage.getItem('demo-reminders')
        if (storedReminders) {
          const userReminders = JSON.parse(storedReminders)
          console.log('🔍 DEBUG: Fallback: loaded reminders from localStorage only:', userReminders.length)
          setReminders(userReminders)
        } else {
          setReminders([])
        }
      } catch (fallbackError) {
        console.error('🔍 DEBUG: Fallback also failed:', fallbackError)
        setReminders([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      console.log('🔍 DEBUG: Reminder save attempted with data:', formData)
      
      if (editingReminder) {
        // Update existing reminder
        const updatedReminder = {
          ...editingReminder,
          ...formData,
          updated_at: new Date().toISOString()
        }

        const updatedReminders = reminders.map(reminder =>
          reminder.id === editingReminder.id ? updatedReminder : reminder
        )
        setReminders(updatedReminders)

        // Save changes to localStorage - only save user-created reminders
        try {
          const userCreatedReminders = updatedReminders.filter(reminder =>
            !['default-reminder-1', 'default-reminder-2'].includes(reminder.id) // Exclude default reminders
          )
          localStorage.setItem('demo-reminders', JSON.stringify(userCreatedReminders))
          console.log('🔍 DEBUG: Reminder edit saved to localStorage')
        } catch (storageError) {
          console.error('🔍 DEBUG: Error saving reminder edit to localStorage:', storageError)
        }

        alert('Reminder updated successfully!')
      } else {
        // Create new reminder
        const newReminder: Reminder = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          created_by_user: {
            id: 'current-user',
            first_name: 'Current',
            last_name: 'User',
            email: 'current@user.com',
            role: currentUserRole || 'admin'
          }
        }

        const updatedReminders = [...reminders, newReminder]
        setReminders(updatedReminders)

        // Save to localStorage
        try {
          const userCreatedReminders = updatedReminders.filter(reminder =>
            !['default-reminder-1', 'default-reminder-2'].includes(reminder.id) // Exclude default reminders
          )
          localStorage.setItem('demo-reminders', JSON.stringify(userCreatedReminders))
          console.log('🔍 DEBUG: New reminder saved to localStorage')
        } catch (storageError) {
          console.error('🔍 DEBUG: Error saving new reminder to localStorage:', storageError)
        }

        alert('Reminder created successfully!')
      }

      resetForm()
      setShowCreateForm(false)
      setEditingReminder(null)
    } catch (error) {
      console.error('Error saving reminder:', error)
      alert('Error saving reminder')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return

    try {
      console.log('🔍 DEBUG: Reminder deletion attempted for ID:', id)
      
      const updatedReminders = reminders.filter(reminder => reminder.id !== id)
      setReminders(updatedReminders)

      // Save changes to localStorage - only save user-created reminders
      try {
        const userCreatedReminders = updatedReminders.filter(reminder =>
          !['default-reminder-1', 'default-reminder-2'].includes(reminder.id) // Exclude default reminders
        )
        localStorage.setItem('demo-reminders', JSON.stringify(userCreatedReminders))
        console.log('🔍 DEBUG: Reminder deletion saved to localStorage')
      } catch (storageError) {
        console.error('🔍 DEBUG: Error saving reminder deletion to localStorage:', storageError)
      }

      alert('Reminder deleted successfully!')
    } catch (error) {
      console.error('Error deleting reminder:', error)
      alert('Error deleting reminder')
    }
  }

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setFormData({
      title: reminder.title,
      message: reminder.message,
      reminder_type: reminder.reminder_type,
      priority: reminder.priority,
      target_audience: reminder.target_audience,
      target_user_ids: reminder.target_user_ids || [],
      target_course_ids: reminder.target_course_ids || [],
      target_emails: reminder.target_emails || [],
      is_dismissible: reminder.is_dismissible,
      expires_at: reminder.expires_at ? new Date(reminder.expires_at).toISOString().slice(0, 16) : ''
    })
    setSelectedEmails(reminder.target_emails || [])
    setShowCreateForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      reminder_type: 'general' as 'general' | 'announcement' | 'deadline' | 'maintenance' | 'course_update' | 'assignment' | 'exam' | 'event',
      priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
      target_audience: 'all_students' as 'all_students' | 'specific_students' | 'specific_emails' | 'course_students' | 'all_users' | 'staff_only' | 'admin_only',
      target_user_ids: [],
      target_course_ids: [],
      target_emails: [],
      is_dismissible: true,
      expires_at: ''
    })
    setSelectedEmails([])
    setEmailSearch('')
  }

  const addEmailToSelection = (email: string) => {
    if (email && !selectedEmails.includes(email)) {
      const newEmails = [...selectedEmails, email]
      setSelectedEmails(newEmails)
      setFormData({ ...formData, target_emails: newEmails })
      setEmailSearch('')
    }
  }

  const removeEmailFromSelection = (email: string) => {
    const newEmails = selectedEmails.filter(e => e !== email)
    setSelectedEmails(newEmails)
    setFormData({ ...formData, target_emails: newEmails })
  }

  const getAvailableTargetOptions = () => {
    if (currentUserRole === 'staff') {
      return [
        { value: 'all_students', label: 'All Students' },
        { value: 'specific_students', label: 'Specific Students' },
        { value: 'specific_emails', label: 'Specific Email Addresses' },
        { value: 'course_students', label: 'Course Students' }
      ]
    } else {
      return [
        { value: 'all_students', label: 'All Students' },
        { value: 'specific_students', label: 'Specific Students' },
        { value: 'specific_emails', label: 'Specific Email Addresses' },
        { value: 'course_students', label: 'Course Students' },
        { value: 'all_users', label: 'All Users' },
        { value: 'staff_only', label: 'Staff Only' },
        { value: 'admin_only', label: 'Admin Only' }
      ]
    }
  }

  const toggleReminderStatus = async (reminder: Reminder) => {
    try {
      console.log('🔍 DEBUG: Toggling reminder status for ID:', reminder.id)
      
      const updatedReminder = {
        ...reminder,
        is_active: !reminder.is_active,
        updated_at: new Date().toISOString()
      }

      const updatedReminders = reminders.map(r =>
        r.id === reminder.id ? updatedReminder : r
      )
      setReminders(updatedReminders)

      // Save changes to localStorage - only save user-created reminders
      try {
        const userCreatedReminders = updatedReminders.filter(reminder =>
          !['default-reminder-1', 'default-reminder-2'].includes(reminder.id) // Exclude default reminders
        )
        localStorage.setItem('demo-reminders', JSON.stringify(userCreatedReminders))
        console.log('🔍 DEBUG: Reminder status toggle saved to localStorage')
      } catch (storageError) {
        console.error('🔍 DEBUG: Error saving reminder status toggle to localStorage:', storageError)
      }
    } catch (error) {
      console.error('Error toggling reminder status:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return '📢'
      case 'deadline': return '⏰'
      case 'maintenance': return '⚠️'
      case 'course_update': return '📚'
      case 'assignment': return '📝'
      case 'exam': return '📋'
      case 'event': return '📅'
      default: return 'ℹ️'
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
            <h1 className="text-3xl font-bold text-gray-900">Reminder Management</h1>
            <p className="text-gray-600 mt-2">Create and manage reminders for students and staff.</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setEditingReminder(null)
              setShowCreateForm(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Create Reminder
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingReminder(null)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.reminder_type}
                      onChange={(e) => setFormData({ ...formData, reminder_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="general">General</option>
                      <option value="announcement">Announcement</option>
                      <option value="deadline">Deadline</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="course_update">Course Update</option>
                      <option value="assignment">Assignment</option>
                      <option value="exam">Exam</option>
                      <option value="event">Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {getAvailableTargetOptions().map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {currentUserRole === 'staff' && (
                    <p className="text-xs text-yellow-600 mt-1">
                      ⚠️ Staff can only send reminders to students
                    </p>
                  )}
                </div>

                {formData.target_audience === 'specific_students' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Students</label>
                    <select
                      multiple
                      value={formData.target_user_ids}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        target_user_ids: Array.from(e.target.selectedOptions, option => option.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                    >
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple students</p>
                  </div>
                )}

                {formData.target_audience === 'specific_emails' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Addresses</label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <input
                          type="email"
                          value={emailSearch}
                          onChange={(e) => setEmailSearch(e.target.value)}
                          placeholder="Enter email address..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addEmailToSelection(emailSearch)
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => addEmailToSelection(emailSearch)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                      
                      {selectedEmails.length > 0 && (
                        <div className="border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                          <div className="flex flex-wrap gap-2">
                            {selectedEmails.map((email, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {email}
                                <button
                                  type="button"
                                  onClick={() => removeEmailFromSelection(email)}
                                  className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        Enter email addresses one by one. Press Enter or click Add to include each email.
                      </p>
                    </div>
                  </div>
                )}

                {formData.target_audience === 'course_students' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Courses</label>
                    <select
                      multiple
                      value={formData.target_course_ids}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        target_course_ids: Array.from(e.target.selectedOptions, option => option.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                    >
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.code} - {course.title}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple courses</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_dismissible"
                    checked={formData.is_dismissible}
                    onChange={(e) => setFormData({ ...formData, is_dismissible: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_dismissible" className="ml-2 block text-sm text-gray-700">
                    Allow users to dismiss this reminder
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingReminder(null)
                      resetForm()
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    {editingReminder ? 'Update' : 'Create'} Reminder
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reminders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Reminders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reminder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Audience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reminders.map((reminder) => (
                <tr key={reminder.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{getTypeIcon(reminder.reminder_type)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{reminder.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-2">{reminder.message}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {reminder.reminder_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <br />
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(reminder.priority)}`}>
                        {reminder.priority.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {reminder.target_audience.replace('_', ' ').toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleReminderStatus(reminder)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        reminder.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {reminder.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{new Date(reminder.created_at).toLocaleDateString()}</div>
                    <div className="text-xs">by {reminder.created_by_user.first_name} {reminder.created_by_user.last_name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(reminder)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {reminders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📢</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders yet</h3>
              <p className="text-gray-500 mb-4">Create your first reminder to get started.</p>
              <button
                onClick={() => {
                  resetForm()
                  setEditingReminder(null)
                  setShowCreateForm(true)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Create Reminder
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}