'use client'

import React, { useState, useEffect } from 'react'

interface Reminder {
  id: string
  title: string
  message: string
  reminder_type: 'general' | 'announcement' | 'deadline' | 'maintenance' | 'course_update' | 'assignment' | 'exam' | 'event'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  target_audience: string
  is_dismissible: boolean
  expires_at?: string
  created_at: string
  created_by_user: {
    id: string
    first_name: string
    last_name: string
    role: string
  }
  is_viewed: boolean
  is_dismissed: boolean
}

export default function TestRemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [currentReminderIndex, setCurrentReminderIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Demo reminders data
    const demoReminders: Reminder[] = [
      {
        id: '1',
        title: 'Welcome to CTE Learning Platform',
        message: 'Welcome to our comprehensive Technical Education platform! Explore your courses and start your learning journey. Check out the new features and don\'t forget to complete your profile.',
        reminder_type: 'announcement',
        priority: 'medium',
        target_audience: 'all_students',
        is_dismissible: true,
        created_at: new Date().toISOString(),
        created_by_user: {
          id: 'admin1',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin'
        },
        is_viewed: false,
        is_dismissed: false
      },
      {
        id: '2',
        title: 'Assignment Deadline Reminder',
        message: 'Don\'t forget to submit your pending assignments before the deadline. Your "Customer Service Excellence Report" is due tomorrow at 11:59 PM.',
        reminder_type: 'deadline',
        priority: 'high',
        target_audience: 'all_students',
        is_dismissible: true,
        created_at: new Date().toISOString(),
        created_by_user: {
          id: 'staff1',
          first_name: 'Maria',
          last_name: 'Santos',
          role: 'staff'
        },
        is_viewed: false,
        is_dismissed: false
      },
      {
        id: '3',
        title: 'System Maintenance Notice',
        message: 'Scheduled maintenance will occur this weekend from 2:00 AM to 6:00 AM on Saturday. Some features may be temporarily unavailable during this time.',
        reminder_type: 'maintenance',
        priority: 'urgent',
        target_audience: 'all_users',
        is_dismissible: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        created_by_user: {
          id: 'admin1',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin'
        },
        is_viewed: false,
        is_dismissed: false
      }
    ]

    // Check localStorage for dismissed reminders
    const dismissedReminders = JSON.parse(localStorage.getItem('dismissed-reminders') || '[]')
    const viewedReminders = JSON.parse(localStorage.getItem('viewed-reminders') || '[]')
    
    // Filter out dismissed reminders and mark viewed ones
    const activeReminders = demoReminders
      .filter(reminder => !dismissedReminders.includes(reminder.id))
      .map(reminder => ({
        ...reminder,
        is_viewed: viewedReminders.includes(reminder.id),
        is_dismissed: dismissedReminders.includes(reminder.id)
      }))
      .filter(reminder => !reminder.is_viewed || !reminder.is_dismissed)

    setReminders(activeReminders)
    setLoading(false)

    if (activeReminders.length > 0) {
      setIsVisible(true)
      // Mark first reminder as viewed
      markReminderAsViewed(activeReminders[0].id)
    }
  }, [])

  const markReminderAsViewed = (reminderId: string) => {
    const viewedReminders = JSON.parse(localStorage.getItem('viewed-reminders') || '[]')
    if (!viewedReminders.includes(reminderId)) {
      viewedReminders.push(reminderId)
      localStorage.setItem('viewed-reminders', JSON.stringify(viewedReminders))
    }
  }

  const dismissReminder = (reminderId: string) => {
    const dismissedReminders = JSON.parse(localStorage.getItem('dismissed-reminders') || '[]')
    dismissedReminders.push(reminderId)
    localStorage.setItem('dismissed-reminders', JSON.stringify(dismissedReminders))

    // Remove dismissed reminder from list
    const updatedReminders = reminders.filter(r => r.id !== reminderId)
    setReminders(updatedReminders)

    if (updatedReminders.length === 0) {
      setIsVisible(false)
    } else if (currentReminderIndex >= updatedReminders.length) {
      setCurrentReminderIndex(0)
      markReminderAsViewed(updatedReminders[0].id)
    } else {
      markReminderAsViewed(updatedReminders[currentReminderIndex].id)
    }
  }

  const nextReminder = () => {
    if (currentReminderIndex < reminders.length - 1) {
      const nextIndex = currentReminderIndex + 1
      setCurrentReminderIndex(nextIndex)
      markReminderAsViewed(reminders[nextIndex].id)
    }
  }

  const previousReminder = () => {
    if (currentReminderIndex > 0) {
      const prevIndex = currentReminderIndex - 1
      setCurrentReminderIndex(prevIndex)
      markReminderAsViewed(reminders[prevIndex].id)
    }
  }

  const closeAllReminders = () => {
    setIsVisible(false)
  }

  const showReminders = () => {
    // Clear localStorage to show reminders again
    localStorage.removeItem('dismissed-reminders')
    localStorage.removeItem('viewed-reminders')
    window.location.reload()
  }

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <span className="text-lg">📢</span>
      case 'deadline':
      case 'assignment':
      case 'exam':
        return <span className="text-lg">⏰</span>
      case 'maintenance':
        return <span className="text-lg">⚠️</span>
      default:
        return <span className="text-lg">ℹ️</span>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50'
      case 'high':
        return 'border-orange-500 bg-orange-50'
      case 'medium':
        return 'border-blue-500 bg-blue-50'
      case 'low':
        return 'border-gray-500 bg-gray-50'
      default:
        return 'border-blue-500 bg-blue-50'
    }
  }

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-700'
      case 'high':
        return 'text-orange-700'
      case 'medium':
        return 'text-blue-700'
      case 'low':
        return 'text-gray-700'
      default:
        return 'text-blue-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const currentReminder = reminders[currentReminderIndex]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Reminder System Test</h1>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Controls</h2>
            <div className="space-y-4">
              <button
                onClick={showReminders}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Show Reminders Again
              </button>
              <p className="text-gray-600">
                Click the button above to reset and show the reminder popup again.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How it Works</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>✅ Reminder System Features:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Popup Display:</strong> Reminders appear as a modal popup at the top-center of the screen</li>
                <li><strong>Priority Levels:</strong> Different colors and styling based on priority (Low, Medium, High, Urgent)</li>
                <li><strong>Multiple Reminders:</strong> Navigate between multiple reminders with Previous/Next buttons</li>
                <li><strong>Dismissible:</strong> Users can dismiss individual reminders (some may be non-dismissible)</li>
                <li><strong>Persistent State:</strong> Uses localStorage to remember viewed/dismissed reminders</li>
                <li><strong>Rich Content:</strong> Shows title, message, creator info, priority, and expiry dates</li>
                <li><strong>Type Icons:</strong> Different icons for different reminder types (📢 Announcement, ⏰ Deadline, ⚠️ Maintenance)</li>
              </ul>
              
              <p className="mt-6">
                <strong>🔧 Admin/Staff Features:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Admin and Staff can create reminders via dedicated management pages</li>
                <li>Target specific audiences (All Students, Specific Students, Course Students, etc.)</li>
                <li>Set priority levels and expiry dates</li>
                <li>Toggle reminder status (Active/Inactive)</li>
                <li>Full CRUD operations for reminder management</li>
              </ul>

              <p className="mt-6">
                <strong>📊 Database Structure:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Reminders table with comprehensive fields</li>
                <li>Reminder views table to track user interactions</li>
                <li>Proper indexing and RLS policies</li>
                <li>Support for targeting specific users or courses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Popup */}
      {isVisible && currentReminder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={closeAllReminders} />
          
          {/* Reminder Modal */}
          <div className={`relative w-full max-w-md mx-auto bg-white rounded-lg shadow-xl border-2 ${getPriorityColor(currentReminder.priority)} animate-in slide-in-from-top-4 duration-300`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className={getPriorityTextColor(currentReminder.priority)}>
                  {getReminderIcon(currentReminder.reminder_type)}
                </div>
                <div>
                  <h3 className={`font-semibold ${getPriorityTextColor(currentReminder.priority)}`}>
                    {currentReminder.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    From {currentReminder.created_by_user.first_name} {currentReminder.created_by_user.last_name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Priority Badge */}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  currentReminder.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  currentReminder.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  currentReminder.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentReminder.priority.toUpperCase()}
                </span>
                
                <button
                  onClick={closeAllReminders}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close all reminders"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="text-gray-700 text-sm leading-relaxed mb-4">
                {currentReminder.message}
              </div>

              {/* Expiry Info */}
              {currentReminder.expires_at && (
                <div className="text-xs text-gray-500 mb-4">
                  Expires: {new Date(currentReminder.expires_at).toLocaleDateString()}
                </div>
              )}

              {/* Navigation and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {reminders.length > 1 && (
                    <>
                      <button
                        onClick={previousReminder}
                        disabled={currentReminderIndex === 0}
                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        ← Previous
                      </button>
                      <span className="text-xs text-gray-500">
                        {currentReminderIndex + 1} of {reminders.length}
                      </span>
                      <button
                        onClick={nextReminder}
                        disabled={currentReminderIndex === reminders.length - 1}
                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {currentReminder.is_dismissible && (
                    <button
                      onClick={() => dismissReminder(currentReminder.id)}
                      className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Dismiss
                    </button>
                  )}
                  <button
                    onClick={closeAllReminders}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}