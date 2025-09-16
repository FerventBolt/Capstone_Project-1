'use client'

import { useState, useEffect } from 'react'
import { notificationService, Notification, NotificationSubscription } from 'C:/CapstoneProject/Capstone_Project-main/src/lib/notifications'

interface NotificationCenterProps {
  userId?: string
  className?: string
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return '✅'
    case 'warning':
      return '⚠️'
    case 'error':
      return '❌'
    default:
      return '📘'
  }
}

const getPriorityColor = (priority: Notification['priority']) => {
  switch (priority) {
    case 'high':
      return 'border-l-red-500'
    case 'medium':
      return 'border-l-yellow-500'
    case 'low':
      return 'border-l-gray-500'
    default:
      return 'border-l-gray-500'
  }
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  return `${Math.floor(diffInMinutes / 1440)}d ago`
}

export default function NotificationCenter({ userId, className = '' }: NotificationCenterProps): JSX.Element {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [subscription, setSubscription] = useState<NotificationSubscription | null>(null)

  // Load initial notifications
  useEffect(() => {
    if (!userId) return

    const loadNotifications = async () => {
      setIsLoading(true)
      try {
        const notificationsData = await notificationService.getNotifications(userId, { limit: 20 })
        setNotifications(notificationsData)
      } catch (error) {
        console.error('Error loading notifications:', error)
        // Fallback to mock data for development
        setNotifications([
          {
            id: '1',
            user_id: userId,
            title: 'New Course Assignment',
            message: 'You have been assigned to teach Restaurant Service Operations.',
            type: 'info',
            priority: 'medium',
            is_read: false,
            action_url: '/staff/courses/1',
            metadata: null,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            user_id: userId,
            title: 'TESDA Exam Reminder',
            message: 'Your Food & Beverages Services NC II exam is scheduled for June 15, 2024.',
            type: 'warning',
            priority: 'high',
            is_read: false,
            action_url: '/student/certifications/1',
            metadata: null,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            user_id: userId,
            title: 'Course Completed',
            message: 'Congratulations! You have successfully completed Front Desk Operations.',
            type: 'success',
            priority: 'medium',
            is_read: true,
            action_url: '/student/courses/2',
            metadata: null,
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [userId])

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return

    try {
      const sub = notificationService.subscribeToNotifications(userId, {
        onInsert: (notification) => {
          setNotifications(prev => [notification, ...prev])
        },
        onUpdate: (notification) => {
          setNotifications(prev => 
            prev.map(n => n.id === notification.id ? notification : n)
          )
        },
        onDelete: ({ id }) => {
          setNotifications(prev => prev.filter(n => n.id !== id))
        }
      })

      setSubscription(sub)

      return () => {
        sub.unsubscribe()
      }
    } catch (error) {
      console.error('Error setting up notification subscription:', error)
    }
  }, [userId])

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      subscription?.unsubscribe()
    }
  }, [subscription])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAsRead = async (id: string) => {
    try {
      const success = await notificationService.markAsRead(id)
      if (success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, is_read: true }
              : notification
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      // Fallback to local state update
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true }
            : notification
        )
      )
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return
    
    try {
      const success = await notificationService.markAllAsRead(userId)
      if (success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        )
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      // Fallback to local state update
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      )
    }
  }

  const removeNotification = async (id: string) => {
    try {
      const success = await notificationService.deleteNotification(id)
      if (success) {
        setNotifications(prev => prev.filter(notification => notification.id !== id))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      // Fallback to local state update
      setNotifications(prev => prev.filter(notification => notification.id !== id))
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.07 2.82l3.12 3.12M7.05 5.84l3.12 3.12M4.03 8.86l3.12 3.12M1.01 11.88l3.12 3.12" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      if (!notification.is_read) {
                        markAsRead(notification.id)
                      }
                      if (notification.action_url) {
                        window.location.href = notification.action_url
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTimestamp(notification.created_at)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeNotification(notification.id)
                        }}
                        className="ml-2 text-gray-400 hover:text-gray-600 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsOpen(false)
                  // Navigate to full notifications page
                  window.location.href = '/notifications'
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}