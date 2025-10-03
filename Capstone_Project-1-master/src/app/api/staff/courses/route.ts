import { NextRequest, NextResponse } from 'next/server'

// This endpoint returns the same courses as admin but can be extended for staff-specific logic
export async function GET(request: NextRequest) {
  try {
    // For now, use the same endpoint as admin
    const adminResponse = await fetch(`${request.nextUrl.origin}/api/admin/courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (adminResponse.ok) {
      const data = await adminResponse.json()
      return NextResponse.json(data)
    } else {
      throw new Error('Failed to fetch courses from admin endpoint')
    }
  } catch (error) {
    console.error('Error fetching staff courses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

// Staff can create courses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward to admin endpoint for now
    const adminResponse = await fetch(`${request.nextUrl.origin}/api/admin/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (adminResponse.ok) {
      const data = await adminResponse.json()
      return NextResponse.json(data)
    } else {
      throw new Error('Failed to create course')
    }
  } catch (error) {
    console.error('Error creating staff course:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create course' },
      { status: 500 }
    )
  }
}