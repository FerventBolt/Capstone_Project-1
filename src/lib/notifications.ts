import { supabase } from '@/lib/supabase/supabase-client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  priority: 'low' | 'medium' | 'high'
  is_read: boolean
  action_url?: string
  metadata?: any
  created_at: string
  updated_at: string
}

export interface NotificationSubscription {
  unsubscribe: () => void
}

class NotificationService {
  private supabase = supabase
  private channels: Map<string, RealtimeChannel> = new Map()

  /**
   * Get notifications for a user
   */
  async getNotifications(userId: string, options: {
    limit?: number
    unreadOnly?: boolean
    priority?: 'low' | 'medium' | 'high'
  } = {}): Promise<Notification[]> {
    try {
      let query = this.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (options.unreadOnly) {
        query = query.eq('is_read', false)
      }

      if (options.priority) {
        query = query.eq('priority', options.priority)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching notifications:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        console.error('Error fetching unread count:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ 
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ 
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }

  /**
   * Create a new notification
   */
  async createNotification(notification: {
    user_id: string
    title: string
    message: string
    type?: 'info' | 'success' | 'warning' | 'error'
    priority?: 'low' | 'medium' | 'high'
    action_url?: string
    metadata?: any
  }): Promise<Notification | null> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert([{
          id: crypto.randomUUID(),
          user_id: notification.user_id,
          title: notification.title,
          message: notification.message,
          type: notification.type || 'info',
          priority: notification.priority || 'medium',
          is_read: false,
          action_url: notification.action_url || null,
          metadata: notification.metadata || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating notification:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating notification:', error)
      return null
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        console.error('Error deleting notification:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting notification:', error)
      return false
    }
  }

  /**
   * Subscribe to real-time notifications for a user
   */
  subscribeToNotifications(
    userId: string,
    callbacks: {
      onInsert?: (notification: Notification) => void
      onUpdate?: (notification: Notification) => void
      onDelete?: (notification: { id: string }) => void
    }
  ): NotificationSubscription {
    const channelName = `notifications:${userId}`
    
    // Remove existing channel if it exists
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe()
      this.channels.delete(channelName)
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (callbacks.onInsert) {
            callbacks.onInsert(payload.new as Notification)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (callbacks.onUpdate) {
            callbacks.onUpdate(payload.new as Notification)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (callbacks.onDelete) {
            callbacks.onDelete({ id: payload.old.id })
          }
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return {
      unsubscribe: () => {
        channel.unsubscribe()
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendBulkNotifications(notifications: Array<{
    user_id: string
    title: string
    message: string
    type?: 'info' | 'success' | 'warning' | 'error'
    priority?: 'low' | 'medium' | 'high'
    action_url?: string
    metadata?: any
  }>): Promise<Notification[]> {
    try {
      const notificationRecords = notifications.map(notification => ({
        id: crypto.randomUUID(),
        user_id: notification.user_id,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        priority: notification.priority || 'medium',
        is_read: false,
        action_url: notification.action_url || null,
        metadata: notification.metadata || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { data, error } = await this.supabase
        .from('notifications')
        .insert(notificationRecords)
        .select()

      if (error) {
        console.error('Error sending bulk notifications:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error sending bulk notifications:', error)
      return []
    }
  }

  /**
   * Get notification statistics for admin
   */
  async getNotificationStats(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<{
    total: number
    byType: Record<string, number>
    byPriority: Record<string, number>
    readRate: number
  }> {
    try {
      const now = new Date()
      let startDate: Date

      switch (timeRange) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
      }

      const { data, error } = await this.supabase
        .from('notifications')
        .select('type, priority, is_read')
        .gte('created_at', startDate.toISOString())

      if (error) {
        console.error('Error fetching notification stats:', error)
        return {
          total: 0,
          byType: {},
          byPriority: {},
          readRate: 0
        }
      }

      const stats = {
        total: data.length,
        byType: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        readRate: 0
      }

      let readCount = 0

      data.forEach((notification: any) => {
        // Count by type
        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1
        
        // Count by priority
        stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1
        
        // Count read notifications
        if (notification.is_read) {
          readCount++
        }
      })

      stats.readRate = data.length > 0 ? (readCount / data.length) * 100 : 0

      return stats
    } catch (error) {
      console.error('Error fetching notification stats:', error)
      return {
        total: 0,
        byType: {},
        byPriority: {},
        readRate: 0
      }
    }
  }

  /**
   * Clean up old notifications
   */
  async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const { data, error } = await this.supabase
        .from('notifications')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id')

      if (error) {
        console.error('Error cleaning up old notifications:', error)
        return 0
      }

      return data?.length || 0
    } catch (error) {
      console.error('Error cleaning up old notifications:', error)
      return 0
    }
  }

  /**
   * Cleanup all channels on service destruction
   */
  cleanup(): void {
    this.channels.forEach(channel => {
      channel.unsubscribe()
    })
    this.channels.clear()
  }
}

export const notificationService = new NotificationService()

// Predefined notification templates
export const NotificationTemplates = {
  courseEnrollment: (courseName: string) => ({
    title: 'Course Enrollment Confirmed',
    message: `You have been successfully enrolled in ${courseName}`,
    type: 'success' as const,
    priority: 'medium' as const
  }),

  examReminder: (examName: string, examDate: string) => ({
    title: 'Upcoming Exam Reminder',
    message: `Your ${examName} exam is scheduled for ${examDate}`,
    type: 'warning' as const,
    priority: 'high' as const
  }),

  certificationApproved: (certificationName: string) => ({
    title: 'Certification Application Approved',
    message: `Your application for ${certificationName} has been approved`,
    type: 'success' as const,
    priority: 'high' as const
  }),

  courseCompletion: (courseName: string) => ({
    title: 'Course Completed',
    message: `Congratulations! You have completed ${courseName}`,
    type: 'success' as const,
    priority: 'medium' as const
  }),

  assignmentDue: (assignmentName: string, dueDate: string) => ({
    title: 'Assignment Due Soon',
    message: `${assignmentName} is due on ${dueDate}`,
    type: 'warning' as const,
    priority: 'medium' as const
  }),

  systemMaintenance: (maintenanceDate: string) => ({
    title: 'Scheduled System Maintenance',
    message: `System maintenance is scheduled for ${maintenanceDate}`,
    type: 'info' as const,
    priority: 'low' as const
  })
}