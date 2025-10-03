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
        console.log('🔍 DEBUG: Found demo session in Reminders GET API:', userSession)
      } catch (error) {
        console.error('🔍 DEBUG: Error parsing demo session in Reminders GET API:', error)
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
    }

    // Check if user is authenticated and has admin/staff role
    if (!userSession || !userSession.authenticated || !['admin', 'staff'].includes(userSession.role)) {
      console.log('🔍 DEBUG: Authentication failed - userSession:', userSession)
      return NextResponse.json({ error: 'Unauthorized - Admin/Staff access required' }, { status: 403 })
    }

    console.log('🔍 DEBUG: Authentication successful for Reminders GET:', userSession.email)

    // Return demo reminders data
    const demoReminders = [
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
      }
    ]

    return NextResponse.json({
      reminders: demoReminders,
      pagination: {
        page: 1,
        limit: 10,
        total: demoReminders.length,
        totalPages: 1
      }
    })

  } catch (error) {
    console.error('Error in GET /api/admin/reminders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for demo session authentication
    const cookies = request.headers.get('cookie') || ''
    const demoSessionCookie = cookies.split(';').find(cookie => cookie.trim().startsWith('demo-session='))
    
    let userSession = null
    if (demoSessionCookie) {
      try {
        const sessionData = decodeURIComponent(demoSessionCookie.split('=')[1])
        userSession = JSON.parse(sessionData)
        console.log('🔍 DEBUG: Found demo session in Reminders POST API:', userSession)
      } catch (error) {
        console.error('🔍 DEBUG: Error parsing demo session in Reminders POST API:', error)
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
    }

    // Check if user is authenticated and has admin/staff role
    if (!userSession || !userSession.authenticated || !['admin', 'staff'].includes(userSession.role)) {
      console.log('🔍 DEBUG: Authentication failed - userSession:', userSession)
      return NextResponse.json({ error: 'Unauthorized - Admin/Staff access required' }, { status: 403 })
    }

    console.log('🔍 DEBUG: Authentication successful for Reminders POST:', userSession.email)

    const body = await request.json()
    const { title, message, reminder_type, priority, target_audience, target_user_ids, target_course_ids, target_emails, expires_at, is_dismissible } = body

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
    }

    // Role-based restrictions: Staff can only target students
    if (userSession.role === 'staff') {
      const allowedAudiences = ['all_students', 'specific_students', 'specific_emails', 'course_students']
      if (!allowedAudiences.includes(target_audience)) {
        return NextResponse.json({
          error: 'Staff can only send reminders to students'
        }, { status: 403 })
      }
    }

    // Create new reminder object
    const newReminder = {
      id: Date.now().toString(),
      title,
      message,
      reminder_type: reminder_type || 'general',
      priority: priority || 'medium',
      target_audience: target_audience || 'all_students',
      target_user_ids: target_user_ids || [],
      target_course_ids: target_course_ids || [],
      target_emails: target_emails || [],
      expires_at: expires_at || null,
      is_dismissible: is_dismissible !== undefined ? is_dismissible : true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by_user: {
        id: userSession.email,
        first_name: userSession.name?.split(' ')[0] || 'User',
        last_name: userSession.name?.split(' ').slice(1).join(' ') || '',
        email: userSession.email,
        role: userSession.role
      }
    }

    return NextResponse.json({ 
      reminder: newReminder,
      message: 'Reminder created successfully (demo mode)'
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/admin/reminders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check for demo session authentication
    const cookies = request.headers.get('cookie') || ''
    const demoSessionCookie = cookies.split(';').find(cookie => cookie.trim().startsWith('demo-session='))
    
    let userSession = null
    if (demoSessionCookie) {
      try {
        const sessionData = decodeURIComponent(demoSessionCookie.split('=')[1])
        userSession = JSON.parse(sessionData)
        console.log('🔍 DEBUG: Found demo session in Reminders PUT API:', userSession)
      } catch (error) {
        console.error('🔍 DEBUG: Error parsing demo session in Reminders PUT API:', error)
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
    }

    // Check if user is authenticated and has admin/staff role
    if (!userSession || !userSession.authenticated || !['admin', 'staff'].includes(userSession.role)) {
      console.log('🔍 DEBUG: Authentication failed - userSession:', userSession)
      return NextResponse.json({ error: 'Unauthorized - Admin/Staff access required' }, { status: 403 })
    }

    console.log('🔍 DEBUG: Authentication successful for Reminders PUT:', userSession.email)

    const body = await request.json()
    const { id, target_audience, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Reminder ID is required' }, { status: 400 })
    }

    // Role-based restrictions: Staff can only target students
    if (userSession.role === 'staff' && target_audience) {
      const allowedAudiences = ['all_students', 'specific_students', 'specific_emails', 'course_students']
      if (!allowedAudiences.includes(target_audience)) {
        return NextResponse.json({
          error: 'Staff can only send reminders to students'
        }, { status: 403 })
      }
    }

    // Return updated reminder (demo)
    const updatedReminder = {
      id,
      target_audience,
      ...updateData,
      updated_at: new Date().toISOString(),
      created_by_user: {
        id: userSession.email,
        first_name: userSession.name?.split(' ')[0] || 'User',
        last_name: userSession.name?.split(' ').slice(1).join(' ') || '',
        email: userSession.email,
        role: userSession.role
      }
    }

    return NextResponse.json({ 
      reminder: updatedReminder,
      message: 'Reminder updated successfully (demo mode)'
    })

  } catch (error) {
    console.error('Error in PUT /api/admin/reminders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check for demo session authentication
    const cookies = request.headers.get('cookie') || ''
    const demoSessionCookie = cookies.split(';').find(cookie => cookie.trim().startsWith('demo-session='))
    
    let userSession = null
    if (demoSessionCookie) {
      try {
        const sessionData = decodeURIComponent(demoSessionCookie.split('=')[1])
        userSession = JSON.parse(sessionData)
        console.log('🔍 DEBUG: Found demo session in Reminders DELETE API:', userSession)
      } catch (error) {
        console.error('🔍 DEBUG: Error parsing demo session in Reminders DELETE API:', error)
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
    }

    // Check if user is authenticated and has admin/staff role
    if (!userSession || !userSession.authenticated || !['admin', 'staff'].includes(userSession.role)) {
      console.log('🔍 DEBUG: Authentication failed - userSession:', userSession)
      return NextResponse.json({ error: 'Unauthorized - Admin/Staff access required' }, { status: 403 })
    }

    console.log('🔍 DEBUG: Authentication successful for Reminders DELETE:', userSession.email)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Reminder ID is required' }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Reminder deleted successfully (demo mode)' 
    })

  } catch (error) {
    console.error('Error in DELETE /api/admin/reminders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}