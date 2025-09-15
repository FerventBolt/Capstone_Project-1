import { NextRequest, NextResponse } from 'next/server'

// Demo session check
function checkDemoSession(request: NextRequest) {
  const sessionCookie = request.cookies.get('demo-session')
  if (!sessionCookie?.value) {
    return false
  }
  
  try {
    const decodedValue = decodeURIComponent(sessionCookie.value)
    const sessionData = JSON.parse(decodedValue)
    return sessionData?.authenticated === true
  } catch (error) {
    console.error('🔍 DEBUG: Error parsing demo session:', error)
    return false
  }
}

// Minimal default exams for merging with localStorage
const DEFAULT_EXAMS = [
  {
    id: 'default-exam-1',
    title: 'Food & Beverages Services NC II Assessment',
    certificationType: 'Food & Beverages Services NC II',
    examDate: '2024-02-15',
    examTime: '09:00',
    venue: 'LPU Cavite - Assessment Center Room 101',
    maxCandidates: 30,
    registeredCandidates: 12,
    status: 'scheduled',
    registrationDeadline: '2024-02-10',
    proctor: 'Prof. Maria Santos',
    requirements: ['Valid ID', 'Certificate of Training Completion'],
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    id: 'default-exam-2',
    title: 'Front Office Services NC II Assessment',
    certificationType: 'Front Office Services NC II',
    examDate: '2024-02-20',
    examTime: '14:00',
    venue: 'LPU Cavite - Assessment Center Room 102',
    maxCandidates: 25,
    registeredCandidates: 8,
    status: 'scheduled',
    registrationDeadline: '2024-02-15',
    proctor: 'Prof. John Dela Cruz',
    requirements: ['Valid ID', 'Certificate of Training Completion'],
    createdAt: '2024-01-20T08:00:00Z'
  }
]

const DEFAULT_REGISTRATIONS = [
  {
    id: 'default-reg-1',
    examId: 'default-exam-1',
    studentId: 'student-1',
    studentName: 'Demo Student 1',
    studentEmail: 'student1@lpunetwork.edu.ph',
    registrationDate: '2024-01-16T10:00:00Z',
    attendanceStatus: 'registered',
    examResult: undefined,
    score: undefined
  },
  {
    id: 'default-reg-2',
    examId: 'default-exam-1',
    studentId: 'student-2',
    studentName: 'Demo Student 2',
    studentEmail: 'student2@lpunetwork.edu.ph',
    registrationDate: '2024-01-17T14:30:00Z',
    attendanceStatus: 'registered',
    examResult: undefined,
    score: undefined
  }
]

export async function GET(request: NextRequest) {
  console.log('🔍 DEBUG: Exams API GET request received')
  
  if (!checkDemoSession(request)) {
    console.log('🔍 DEBUG: Exams API - No valid demo session')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('🔍 DEBUG: Exams API - Returning minimal default data:', DEFAULT_EXAMS.length, 'exams,', DEFAULT_REGISTRATIONS.length, 'registrations')
  
  return NextResponse.json({
    success: true,
    exams: DEFAULT_EXAMS,
    registrations: DEFAULT_REGISTRATIONS
  })
}

export async function POST(request: NextRequest) {
  console.log('🔍 DEBUG: Exams API POST request received')
  
  if (!checkDemoSession(request)) {
    console.log('🔍 DEBUG: Exams API - No valid demo session')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    console.log('🔍 DEBUG: Exams API - Creating exam:', body)

    // Create new exam with generated ID
    const newExam = {
      id: `exam-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: body.title,
      certificationType: body.certificationType,
      examDate: body.examDate,
      examTime: body.examTime,
      venue: body.venue,
      maxCandidates: body.maxCandidates,
      registeredCandidates: 0,
      status: 'scheduled',
      registrationDeadline: body.registrationDeadline,
      proctor: body.proctor,
      requirements: body.requirements || ['Valid ID', 'Certificate of Training Completion'],
      createdAt: new Date().toISOString()
    }

    console.log('🔍 DEBUG: Exams API - Created exam:', newExam)

    return NextResponse.json({
      success: true,
      exam: newExam
    })
  } catch (error) {
    console.error('🔍 DEBUG: Exams API - Error creating exam:', error)
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  console.log('🔍 DEBUG: Exams API PUT request received')
  
  if (!checkDemoSession(request)) {
    console.log('🔍 DEBUG: Exams API - No valid demo session')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    console.log('🔍 DEBUG: Exams API - Updating exam:', body.id)

    // Return updated exam
    const updatedExam = {
      ...body,
      updatedAt: new Date().toISOString()
    }

    console.log('🔍 DEBUG: Exams API - Updated exam:', updatedExam)

    return NextResponse.json({
      success: true,
      exam: updatedExam
    })
  } catch (error) {
    console.error('🔍 DEBUG: Exams API - Error updating exam:', error)
    return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  console.log('🔍 DEBUG: Exams API DELETE request received')
  
  if (!checkDemoSession(request)) {
    console.log('🔍 DEBUG: Exams API - No valid demo session')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    console.log('🔍 DEBUG: Exams API - Deleting exam:', body.id)

    return NextResponse.json({
      success: true,
      message: 'Exam deleted successfully'
    })
  } catch (error) {
    console.error('🔍 DEBUG: Exams API - Error deleting exam:', error)
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 })
  }
}