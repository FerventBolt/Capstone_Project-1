import { NextRequest, NextResponse } from 'next/server'

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
        console.log('🔍 DEBUG: Found demo session in Users API:', userSession)
      } catch (error) {
        console.error('🔍 DEBUG: Error parsing demo session in Users API:', error)
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
    }

    // Check if user is authenticated and is admin
    if (!userSession || !userSession.authenticated || userSession.role !== 'admin') {
      console.log('🔍 DEBUG: Authentication failed - userSession:', userSession)
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    console.log('🔍 DEBUG: Admin authentication successful for Users API:', userSession.email)

    const body = await request.json()
    const {
      email,
      firstName,
      lastName,
      role,
      status
    } = body

    // Validate required fields
    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create new user object
    const newUser = {
      id: Date.now().toString(),
      email,
      firstName,
      lastName,
      role,
      status: status || 'active',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
    
    console.log('🔍 DEBUG: User created successfully:', newUser)

    // Return the user data - the frontend will handle localStorage storage
    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error creating user:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

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
        console.log('🔍 DEBUG: Found demo session in Users GET API:', userSession)
      } catch (error) {
        console.error('🔍 DEBUG: Error parsing demo session in Users GET API:', error)
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
    }

    // Check if user is authenticated
    if (!userSession || !userSession.authenticated) {
      console.log('🔍 DEBUG: Authentication failed in Users GET - userSession:', userSession)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 DEBUG: Authentication successful for Users GET:', userSession.email)
    
    // Return minimal default users - the frontend will handle localStorage and merge with created users
    const defaultUsers = [
      {
        id: '1',
        email: 'admin@lpu.edu.ph',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        status: 'active',
        lastLogin: '2024-01-15T10:30:00.000Z',
        createdAt: '2024-01-01T09:00:00.000Z'
      },
      {
        id: '2',
        email: 'student@lpunetwork.edu.ph',
        firstName: 'Demo',
        lastName: 'Student',
        role: 'student',
        status: 'active',
        lastLogin: '2024-01-14T16:15:00.000Z',
        createdAt: '2024-01-03T11:30:00.000Z'
      }
    ]
    
    console.log('🔍 DEBUG: Returning default users, frontend will merge with localStorage')

    return NextResponse.json({ users: defaultUsers }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error fetching users:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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
        console.log('🔍 DEBUG: Found demo session in Users PUT API:', userSession)
      } catch (error) {
        console.error('🔍 DEBUG: Error parsing demo session in Users PUT API:', error)
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
    }

    // Check if user is authenticated and is admin
    if (!userSession || !userSession.authenticated || userSession.role !== 'admin') {
      console.log('🔍 DEBUG: Authentication failed - userSession:', userSession)
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { id, email, firstName, lastName, role, status } = body

    // Validate required fields
    if (!id || !email || !firstName || !lastName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create updated user object
    const updatedUser = {
      id,
      email,
      firstName,
      lastName,
      role,
      status: status || 'active',
      lastLogin: new Date().toISOString(),
      createdAt: body.createdAt || new Date().toISOString()
    }
    
    console.log('🔍 DEBUG: User updated successfully:', updatedUser)

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error updating user:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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
        console.log('🔍 DEBUG: Found demo session in Users DELETE API:', userSession)
      } catch (error) {
        console.error('🔍 DEBUG: Error parsing demo session in Users DELETE API:', error)
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
    }

    // Check if user is authenticated and is admin
    if (!userSession || !userSession.authenticated || userSession.role !== 'admin') {
      console.log('🔍 DEBUG: Authentication failed - userSession:', userSession)
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    console.log('🔍 DEBUG: User deleted successfully:', userId)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error deleting user:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}