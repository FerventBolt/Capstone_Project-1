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

interface ReminderPopupProps {
  userId?: string
  className?: string
}

export default function ReminderPopupDemo({ userId, className = '' }: ReminderPopupProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [currentReminderIndex, setCurrentReminderIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only show reminders on fresh login, not on page refresh
    const shouldShowReminders = checkIfShouldShowReminders()
    if (shouldShowReminders) {
      fetchReminders()
    } else {
      setLoading(false)
    }
  }, [userId])

  const checkIfShouldShowReminders = () => {
    // Check if this is a fresh login session
    const currentSession = sessionStorage.getItem('current-session-id')
    const lastReminderSession = localStorage.getItem('last-reminder-session')
    
    // If no current session, this might be a fresh login
    if (!currentSession) {
      // Generate a new session ID for this browser session
      const newSessionId = Date.now().toString()
      sessionStorage.setItem('current-session-id', newSessionId)
      
      // If this session hasn't shown reminders yet, show them
      if (lastReminderSession !== newSessionId) {
        localStorage.setItem('last-reminder-session', newSessionId)
        return true
      }
    } else {
      // Session exists, check if we've already shown reminders for this session
      if (lastReminderSession !== currentSession) {
        localStorage.setItem('last-reminder-session', currentSession)
        return true
      }
    }
    
    return false
  }

  const fetchReminders = async () => {
    try {
      setLoading(true)
      
      // Try to fetch from API first, fallback to demo data
      let fetchedReminders: Reminder[] = []
      
      try {
        const response = await fetch('/api/student/reminders')
        if (response.ok) {
          const data = await response.json()
          fetchedReminders = data.reminders || []
        }
      } catch (apiError) {
        console.log('API not available, using demo data')
      }

      // If no API data, use demo reminders
      if (fetchedReminders.length === 0) {
        fetchedReminders = [
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
      }

      // Check localStorage for dismissed reminders
      const dismissedReminders = JSON.parse(localStorage.getItem('dismissed-reminders') || '[]')
      const viewedReminders = JSON.parse(localStorage.getItem('viewed-reminders') || '[]')
      
      // Filter out dismissed reminders and mark viewed ones
      const activeReminders = fetchedReminders
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
    } catch (error) {
      console.error('Error fetching reminders:', error)
      setLoading(false)
    }
  }

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

  if (loading || !isVisible || reminders.length === 0) {
    return null
  }

  const currentReminder = reminders[currentReminderIndex]

  return (
    <div className={`fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 ${className}`}>
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
  )
}