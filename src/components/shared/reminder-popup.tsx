'use client'

import { useState, useEffect } from 'react'

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

export default function ReminderPopup({ userId, className = '' }: ReminderPopupProps): JSX.Element | null {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [currentReminderIndex, setCurrentReminderIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReminders()
  }, [userId])

  const fetchReminders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/student/reminders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const unviewedReminders = data.reminders.filter((r: Reminder) => !r.is_viewed && !r.is_dismissed)
        setReminders(unviewedReminders)
        
        if (unviewedReminders.length > 0) {
          setIsVisible(true)
          // Mark first reminder as viewed
          markReminderAsViewed(unviewedReminders[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const markReminderAsViewed = async (reminderId: string) => {
    try {
      await fetch('/api/student/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reminder_id: reminderId,
          action: 'view'
        })
      })
    } catch (error) {
      console.error('Error marking reminder as viewed:', error)
    }
  }

  const dismissReminder = async (reminderId: string) => {
    try {
      await fetch('/api/student/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reminder_id: reminderId,
          action: 'dismiss'
        })
      })

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
    } catch (error) {
      console.error('Error dismissing reminder:', error)
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