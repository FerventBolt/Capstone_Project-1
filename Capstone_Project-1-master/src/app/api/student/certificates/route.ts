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
    status: 'approved',
    remarks: 'Certificate verified and approved.',
    submitted_at: '2024-01-20',
    reviewed_at: '2024-01-22',
    reviewed_by: 'admin@lpu.edu.ph'
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
    status: 'pending',
    submitted_at: '2024-02-05'
  }
]

export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual Supabase query
    // const { data: submissions, error } = await supabase
    //   .from('student_certificate_submissions')
    //   .select('*')
    //   .eq('student_id', userId)
    //   .order('submitted_at', { ascending: false })

    return NextResponse.json({
      success: true,
      submissions: mockSubmissions
    })
  } catch (error) {
    console.error('Error fetching certificate submissions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      certificate_type,
      certificate_name,
      certificate_number,
      course_name,
      date_accredited,
      expiration_date,
      file_url,
      file_name
    } = body

    // TODO: Replace with actual Supabase insert
    // const { data: submission, error } = await supabase
    //   .from('student_certificate_submissions')
    //   .insert({
    //     student_id: userId,
    //     certificate_type,
    //     certificate_name,
    //     certificate_number,
    //     course_name,
    //     date_accredited,
    //     expiration_date,
    //     file_url,
    //     file_name,
    //     status: 'pending'
    //   })
    //   .select()
    //   .single()

    // Mock response
    const newSubmission = {
      id: Date.now().toString(),
      student_id: 'current-student',
      student_name: 'Current Student',
      student_email: 'student@lpunetwork.edu.ph',
      certificate_type,
      certificate_name,
      certificate_number,
      course_name,
      date_accredited,
      expiration_date,
      file_url,
      file_name,
      status: 'pending',
      submitted_at: new Date().toISOString().split('T')[0]
    }

    return NextResponse.json({
      success: true,
      submission: newSubmission
    })
  } catch (error) {
    console.error('Error creating certificate submission:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create submission' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, remarks } = body

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
      reviewed_at: new Date().toISOString().split('T')[0],
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