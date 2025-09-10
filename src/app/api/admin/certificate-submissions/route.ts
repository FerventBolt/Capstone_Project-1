import { NextRequest, NextResponse } from 'next/server'

// Mock data for development
const mockSubmissions = [
  {
    id: '1',
    student_id: 'student-1',
    student_name: 'Juan Dela Cruz',
    student_email: 'juan.student@lpunetwork.edu.ph',
    certificate_type: 'NC',
    certificate_name: 'Food & Beverages Services NC II',
    certificate_number: 'FBS-2024-001',
    course_name: 'Restaurant Service Operations',
    date_accredited: '2024-01-15',
    expiration_date: '2027-01-15',
    file_url: '/certificates/fbs-certificate.pdf',
    file_name: 'FBS_Certificate.pdf',
    status: 'pending',
    submitted_at: '2024-01-20'
  },
  {
    id: '2',
    student_id: 'student-2',
    student_name: 'Maria Santos',
    student_email: 'maria.student@lpunetwork.edu.ph',
    certificate_type: 'COC',
    certificate_name: 'Commercial Cooking COC',
    certificate_number: 'CC-2024-002',
    course_name: 'Basic Culinary Arts',
    date_accredited: '2024-02-01',
    expiration_date: '2026-02-01',
    file_url: '/certificates/cc-certificate.pdf',
    file_name: 'CC_Certificate.pdf',
    status: 'approved',
    remarks: 'Certificate verified and approved.',
    submitted_at: '2024-02-05',
    reviewed_at: '2024-02-07',
    reviewed_by: 'admin@lpu.edu.ph'
  },
  {
    id: '3',
    student_id: 'student-3',
    student_name: 'Ana Rodriguez',
    student_email: 'ana.student@lpunetwork.edu.ph',
    certificate_type: 'NC',
    certificate_name: 'Housekeeping Services NC II',
    certificate_number: 'HKS-2023-003',
    course_name: 'Hotel Housekeeping Operations',
    date_accredited: '2023-12-10',
    expiration_date: '2026-12-10',
    file_url: '/certificates/hks-certificate.pdf',
    file_name: 'HKS_Certificate.pdf',
    status: 'rejected',
    remarks: 'Certificate number could not be verified. Please resubmit with correct certificate number.',
    submitted_at: '2024-01-10',
    reviewed_at: '2024-01-12',
    reviewed_by: 'admin@lpu.edu.ph'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // TODO: Replace with actual Supabase query
    // const query = supabase
    //   .from('student_certificate_submissions')
    //   .select(`
    //     *,
    //     student:users!student_id(first_name, last_name, email)
    //   `)
    //   .order('submitted_at', { ascending: false })
    
    // if (status && status !== 'all') {
    //   query.eq('status', status)
    // }

    // const { data: submissions, error } = await query

    let filteredSubmissions = mockSubmissions
    if (status && status !== 'all') {
      filteredSubmissions = mockSubmissions.filter(sub => sub.status === status)
    }

    return NextResponse.json({
      success: true,
      submissions: filteredSubmissions
    })
  } catch (error) {
    console.error('Error fetching certificate submissions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
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