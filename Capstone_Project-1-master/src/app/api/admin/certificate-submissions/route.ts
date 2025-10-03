export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value
  if (!token) return null
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only allow admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  // Fetch certificate submissions
  const { data, error } = await supabase
    .from('certificate_submissions')
    .select(`
      *,
      student:users!student_id(first_name, last_name, email)
    `)
    .order('submitted_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let filteredSubmissions = data
  if (status && status !== 'all') {
    filteredSubmissions = data.filter(sub => sub.status === status)
  }

  return NextResponse.json({
    success: true,
    submissions: filteredSubmissions
  })
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, remarks } = body

    // Validate required fields
    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // TODO: Replace with actual Supabase update
    // const { data: submission, error } = await supabase
    //   .from('student_certificate_submissions')
    //   .update({
    //     status,
    //     remarks,
    //     reviewed_at: new Date().toISOString(),
    //     reviewed_by: adminUserId
    //   })
    //   .eq('id', id)
    //   .select()
    //   .single()

    // Mock response
    const updatedSubmission = {
      id,
      status,
      remarks,
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'admin@lpu.edu.ph'
    }

    return NextResponse.json({
      success: true,
      submission: updatedSubmission
    })
  } catch (error) {
    console.error('Error updating certificate submission:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update submission' },
      { status: 500 }
    )
  }
}