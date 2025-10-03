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
        console.log('🔍 DEBUG: Found demo session in Certifications API:', userSession)
      } catch (error) {
        console.error('🔍 DEBUG: Error parsing demo session in Certifications API:', error)
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
    }

    // Check if user is authenticated and is admin
    if (!userSession || !userSession.authenticated || userSession.role !== 'admin') {
      console.log('🔍 DEBUG: Authentication failed - userSession:', userSession)
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    console.log('🔍 DEBUG: Admin authentication successful for Certifications API:', userSession.email)

    const body = await request.json()
    const {
      name,
      code,
      description,
      type,
      duration_hours,
      prerequisites,
      is_active
    } = body

    // Validate required fields
    if (!name || !code || !description || !type || !duration_hours) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create new certification object
    const newCertification = {
      id: Date.now().toString(),
      name,
      code,
      description,
      type,
      duration_hours,
      prerequisites: prerequisites || [],
      is_active: is_active !== undefined ? is_active : true,
      created_at: new Date().toISOString().split('T')[0],
      applications_count: 0,
      completions_count: 0
    }
    
    console.log('🔍 DEBUG: Certification created successfully:', newCertification)

    // Return the certification data - the frontend will handle localStorage storage
    return NextResponse.json({
      success: true,
      certification: newCertification,
      message: 'Certification created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error creating certification:', error)
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
        console.log('🔍 DEBUG: Found demo session in Certifications GET API:', userSession)
      } catch (error) {
        console.error('🔍 DEBUG: Error parsing demo session in Certifications GET API:', error)
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
    }

    // Check if user is authenticated
    if (!userSession || !userSession.authenticated) {
      console.log('🔍 DEBUG: Authentication failed in Certifications GET - userSession:', userSession)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 DEBUG: Authentication successful for Certifications GET:', userSession.email)
    
    // Return minimal default certifications - the frontend will handle localStorage and merge with created certifications
    const defaultCertifications = [
      {
        id: '1',
        name: 'Food & Beverages Services NC II',
        code: 'FBS-NCII',
        description: 'National Certificate II in Food & Beverages Services.',
        type: 'food_beverages',
        duration_hours: 320,
        prerequisites: ['Basic Food Safety'],
        is_active: true,
        created_at: '2023-01-15',
        applications_count: 5,
        completions_count: 3
      },
      {
        id: '2',
        name: 'Tourism Services NC II',
        code: 'TS-NCII',
        description: 'National Certificate II in Tourism Services.',
        type: 'tourism',
        duration_hours: 280,
        prerequisites: ['Communication Skills'],
        is_active: true,
        created_at: '2023-01-15',
        applications_count: 3,
        completions_count: 2
      }
    ]
    
    console.log('🔍 DEBUG: Returning default certifications, frontend will merge with localStorage')

    return NextResponse.json({ certifications: defaultCertifications }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error fetching certifications:', error)
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
        console.log('🔍 DEBUG: Found demo session in Certifications PUT API:', userSession)
      } catch (error) {
        console.error('🔍 DEBUG: Error parsing demo session in Certifications PUT API:', error)
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
    }

    // Check if user is authenticated and is admin
    if (!userSession || !userSession.authenticated || userSession.role !== 'admin') {
      console.log('🔍 DEBUG: Authentication failed - userSession:', userSession)
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { id, name, code, description, type, duration_hours, prerequisites, is_active } = body

    // Validate required fields
    if (!id || !name || !code || !description || !type || !duration_hours) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create updated certification object
    const updatedCertification = {
      id,
      name,
      code,
      description,
      type,
      duration_hours,
      prerequisites: prerequisites || [],
      is_active: is_active !== undefined ? is_active : true,
      created_at: body.created_at || new Date().toISOString().split('T')[0],
      applications_count: body.applications_count || 0,
      completions_count: body.completions_count || 0
    }
    
    console.log('🔍 DEBUG: Certification updated successfully:', updatedCertification)

    return NextResponse.json({
      success: true,
      certification: updatedCertification,
      message: 'Certification updated successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error updating certification:', error)
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
        console.log('🔍 DEBUG: Found demo session in Certifications DELETE API:', userSession)
      } catch (error) {
        console.error('🔍 DEBUG: Error parsing demo session in Certifications DELETE API:', error)
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
    }

    // Check if user is authenticated and is admin
    if (!userSession || !userSession.authenticated || userSession.role !== 'admin') {
      console.log('🔍 DEBUG: Authentication failed - userSession:', userSession)
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const certificationId = searchParams.get('id')

    if (!certificationId) {
      return NextResponse.json({ error: 'Certification ID is required' }, { status: 400 })
    }
    
    console.log('🔍 DEBUG: Certification deleted successfully:', certificationId)

    return NextResponse.json({
      success: true,
      message: 'Certification deleted successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error deleting certification:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}