import { NextRequest, NextResponse } from 'next/server'

// Mock data for development
const mockEnrollments = [
  {
    id: '1',
    courseId: '1',
    studentId: 'current-student',
    enrollmentDate: '2024-01-15',
    progress: 85,
    status: 'enrolled',
    lessonsCompleted: 17,
    totalLessons: 20,
    nextLesson: 'Wine Service and Pairing'
  },
  {
    id: '2',
    courseId: '2',
    studentId: 'current-student',
    enrollmentDate: '2023-10-01',
    progress: 100,
    status: 'completed',
    finalGrade: 92,
    completionDate: '2023-12-15',
    lessonsCompleted: 15,
    totalLessons: 15
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId') || 'current-student'

    // TODO: Replace with actual Supabase query
    // const { data: enrollments, error } = await supabase
    //   .from('course_enrollments')
    //   .select(`
    //     *,
    //     course:courses(*)
    //   `)
    //   .eq('student_id', studentId)
    //   .order('enrollment_date', { ascending: false })

    const studentEnrollments = mockEnrollments.filter(
      enrollment => enrollment.studentId === studentId
    )

    return NextResponse.json({
      success: true,
      enrollments: studentEnrollments
    })
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, studentId } = body

    // Validate required fields
    if (!courseId || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // TODO: Replace with actual Supabase operations
    // Check if already enrolled
    // const { data: existingEnrollment } = await supabase
    //   .from('course_enrollments')
    //   .select('id')
    //   .eq('student_id', studentId)
    //   .eq('course_id', courseId)
    //   .single()

    // if (existingEnrollment) {
    //   return NextResponse.json(
    //     { success: false, error: 'Already enrolled in this course' },
    //     { status: 400 }
    //   )
    // }

    // Check course capacity
    // const { data: course } = await supabase
    //   .from('courses')
    //   .select('enrolled_students, max_students')
    //   .eq('id', courseId)
    //   .single()

    // if (course && course.enrolled_students >= course.max_students) {
    //   return NextResponse.json(
    //     { success: false, error: 'Course is full' },
    //     { status: 400 }
    //   )
    // }

    // Create enrollment
    // const { data: enrollment, error } = await supabase
    //   .from('course_enrollments')
    //   .insert({
    //     student_id: studentId,
    //     course_id: courseId,
    //     enrollment_date: new Date().toISOString(),
    //     status: 'active',
    //     progress_percentage: 0
    //   })
    //   .select()
    //   .single()

    // Update course enrollment count
    // await supabase
    //   .from('courses')
    //   .update({
    //     enrolled_students: course.enrolled_students + 1
    //   })
    //   .eq('id', courseId)

    // Mock response
    const newEnrollment = {
      id: Date.now().toString(),
      courseId,
      studentId,
      enrollmentDate: new Date().toISOString().split('T')[0],
      progress: 0,
      status: 'enrolled',
      lessonsCompleted: 0,
      totalLessons: 20,
      nextLesson: 'Introduction'
    }

    return NextResponse.json({
      success: true,
      enrollment: newEnrollment
    })
  } catch (error) {
    console.error('Error creating enrollment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create enrollment' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, progress, finalGrade, completionDate } = body

    // TODO: Replace with actual Supabase update
    // const { data: enrollment, error } = await supabase
    //   .from('course_enrollments')
    //   .update({
    //     status,
    //     progress_percentage: progress,
    //     final_grade: finalGrade,
    //     completion_date: completionDate,
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('id', id)
    //   .select()
    //   .single()

    // Mock response
    const updatedEnrollment = {
      id,
      status,
      progress,
      finalGrade,
      completionDate,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      enrollment: updatedEnrollment
    })
  } catch (error) {
    console.error('Error updating enrollment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update enrollment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, courseId } = body

    // TODO: Replace with actual Supabase operations
    // Delete enrollment
    // const { error } = await supabase
    //   .from('course_enrollments')
    //   .delete()
    //   .eq('id', id)

    // Update course enrollment count
    // const { data: course } = await supabase
    //   .from('courses')
    //   .select('enrolled_students')
    //   .eq('id', courseId)
    //   .single()

    // if (course) {
    //   await supabase
    //     .from('courses')
    //     .update({
    //       enrolled_students: Math.max(0, course.enrolled_students - 1)
    //     })
    //     .eq('id', courseId)
    // }

    return NextResponse.json({
      success: true,
      message: 'Enrollment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting enrollment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete enrollment' },
      { status: 500 }
    )
  }
}