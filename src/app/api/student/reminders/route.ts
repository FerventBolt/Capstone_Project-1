import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check for demo session authentication
    const cookies = request.headers.get('cookie') || ''
    const demoSessionCookie = cookies.split(';').find(cookie => cookie.trim().startsWith('demo-session='))
    
    let userSession = null
    if (demoSessionCookie) {
      try {
        const sessionData = decodeURIComponent(demoSessionCookie.split('=')[1])
        userSession = JSON.parse(sessionData)
        console.log('🔍 DEBUG: Found demo session in Student Reminders GET API:', userSession)
      } catch (error) {
        console.error('🔍 DEBUG: Error parsing demo session in Student Reminders GET API:', error)
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
    }

    // Check if user is authenticated
    if (!userSession || !userSession.authenticated) {
      console.log('🔍 DEBUG: Authentication failed - userSession:', userSession)
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    console.log('🔍 DEBUG: Authentication successful for Student Reminders GET:', userSession.email)

    // Get current user email for email-based targeting
    const currentUserEmail = userSession.email
    const currentUserRole = userSession.role

    // Return demo reminders data filtered for the current user
    const allReminders = [
      {
        id: '1',
        title: 'Welcome to CTE Learning Platform',
        message: 'Welcome to our comprehensive Technical Education platform! Explore your courses and start your learning journey.',
        reminder_type: 'announcement',
        priority: 'medium',
        target_audience: 'all_students',
        target_user_ids: [],
        target_course_ids: [],
        target_emails: [],
        is_active: true,
        is_dismissible: true,
        expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by_user: {
          id: 'admin1',
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@lpu.edu.ph',
          role: 'admin'
        }
      },
      {
        id: '2',
        title: 'Assignment Deadline Reminder',
        message: 'Don\'t forget to submit your pending assignments before the deadline. Check your course dashboard for details.',
        reminder_type: 'deadline',
        priority: 'high',
        target_audience: 'all_students',
        target_user_ids: [],
        target_course_ids: [],
        target_emails: [],
        is_active: true,
        is_dismissible: true,
        expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by_user: {
          id: 'staff1',
          first_name: 'Maria',
          last_name: 'Santos',
          email: 'maria.santos@lpu.edu.ph',
          role: 'staff'
        }
      },
      {
        id: '3',
        title: 'System Maintenance Notice',
        message: 'Scheduled maintenance will occur this weekend from 2:00 AM to 6:00 AM. Some features may be temporarily unavailable.',
        reminder_type: 'maintenance',
        priority: 'urgent',
        target_audience: 'all_users',
        target_user_ids: [],
        target_course_ids: [],
        target_emails: [],
        is_active: true,
        is_dismissible: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by_user: {
          id: 'admin1',
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@lpu.edu.ph',
          role: 'admin'
        }
      },
      {
        id: '4',
        title: 'Specific Email Test',
        message: 'This is a test reminder sent to specific email addresses.',
        reminder_type: 'general',
        priority: 'medium',
        target_audience: 'specific_emails',
        target_user_ids: [],
        target_course_ids: [],
        target_emails: ['student@lpunetwork.edu.ph', 'test@example.com'],
        is_active: true,
        is_dismissible: true,
        expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by_user: {
          id: 'admin1',
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@lpu.edu.ph',
          role: 'admin'
        }
      }
    ]

    // Filter reminders based on targeting rules
    const filteredReminders = allReminders.filter(reminder => {
      // Check if reminder is active and not expired
      if (!reminder.is_active) return false
      if (reminder.expires_at && new Date(reminder.expires_at) < new Date()) return false

      // Check targeting rules
      switch (reminder.target_audience) {
        case 'all_users':
          return true
        case 'all_students':
          return currentUserRole === 'student'
        case 'staff_only':
          return currentUserRole === 'staff'
        case 'admin_only':
          return currentUserRole === 'admin'
        case 'specific_emails':
          return (reminder.target_emails as string[]).includes(currentUserEmail)
        case 'specific_students':
          // In a real implementation, this would check target_user_ids
          return currentUserRole === 'student'
        case 'course_students':
          // In a real implementation, this would check course enrollment
          return currentUserRole === 'student'
        default:
          return false
      }
    })

    return NextResponse.json({
      reminders: filteredReminders,
      user: {
        email: currentUserEmail,
        role: currentUserRole
      }
    })

  } catch (error) {
    console.error('Error in GET /api/student/reminders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}