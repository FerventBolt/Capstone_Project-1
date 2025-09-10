import { NextRequest, NextResponse } from 'next/server'

// Mock data for development
const defaultCourses = [
  {
    id: '1',
    title: 'Restaurant Service Operations NC II',
    code: 'RSO101',
    description: 'Learn the fundamentals of restaurant service including table setting, order taking, food and beverage service, and customer service excellence.',
    category: 'Food & Beverages',
    level: 'NC II',
    duration: 160,
    instructor: 'Prof. Maria Santos',
    enrolledStudents: 15,
    maxStudents: 25,
    totalLessons: 12,
    completedLessons: 0,
    completionRate: 75,
    pendingSubmissions: 8,
    status: 'active',
    coursePassword: 'rso2024',
    allowSelfEnrollment: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Front Desk Operations NC II',
    code: 'FDO102',
    description: 'Comprehensive training in hotel front desk operations, reservations, guest relations, and customer service.',
    category: 'Front Office',
    level: 'NC II',
    duration: 140,
    instructor: 'Ms. Ana Rodriguez',
    enrolledStudents: 18,
    maxStudents: 30,
    totalLessons: 10,
    completedLessons: 0,
    completionRate: 60,
    pendingSubmissions: 12,
    status: 'active',
    coursePassword: '',
    allowSelfEnrollment: true,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-20'
  },
  {
    id: '3',
    title: 'Housekeeping Operations NC II',
    code: 'HKO103',
    description: 'Complete training in housekeeping operations including room cleaning, laundry management, and maintenance coordination.',
    category: 'Housekeeping',
    level: 'NC II',
    duration: 120,
    instructor: 'Mrs. Carmen Lopez',
    enrolledStudents: 12,
    maxStudents: 20,
    totalLessons: 8,
    completedLessons: 0,
    completionRate: 80,
    pendingSubmissions: 5,
    status: 'active',
    coursePassword: 'house123',
    allowSelfEnrollment: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-25'
  },
  {
    id: '4',
    title: 'Tourism Services NC II',
    code: 'TSV104',
    description: 'Learn tourism services including tour guiding, destination knowledge, and customer service in tourism industry.',
    category: 'Tourism',
    level: 'NC II',
    duration: 180,
    instructor: 'Mr. Jose Reyes',
    enrolledStudents: 8,
    maxStudents: 15,
    totalLessons: 15,
    completedLessons: 0,
    completionRate: 45,
    pendingSubmissions: 10,
    status: 'active',
    coursePassword: '',
    allowSelfEnrollment: true,
    createdAt: '2024-01-12',
    updatedAt: '2024-01-28'
  },
  {
    id: '5',
    title: 'Commercial Cooking NC II',
    code: 'CCK105',
    description: 'Professional cooking techniques, food preparation, kitchen management, and culinary arts fundamentals.',
    category: 'Cookery',
    level: 'NC II',
    duration: 200,
    instructor: 'Chef Roberto Cruz',
    enrolledStudents: 20,
    maxStudents: 25,
    totalLessons: 18,
    completedLessons: 0,
    completionRate: 85,
    pendingSubmissions: 15,
    status: 'active',
    coursePassword: 'cook2024',
    allowSelfEnrollment: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-02-01'
  }
]

export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual Supabase query
    // const { data: courses, error } = await supabase
    //   .from('courses')
    //   .select('*')
    //   .eq('is_active', true)
    //   .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      courses: defaultCourses
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      category,
      level,
      duration,
      instructor,
      maxStudents,
      status
    } = body

    // TODO: Replace with actual Supabase insert
    // const { data: course, error } = await supabase
    //   .from('courses')
    //   .insert({
    //     title,
    //     description,
    //     category,
    //     level,
    //     duration,
    //     instructor,
    //     max_students: maxStudents,
    //     status,
    //     enrolled_students: 0,
    //     created_by: userId
    //   })
    //   .select()
    //   .single()

    // Mock response
    const newCourse = {
      id: Date.now().toString(),
      title,
      code: body.code || `${category?.substring(0,3).toUpperCase()}${Math.floor(Math.random() * 900) + 100}`,
      description,
      category,
      level,
      duration: parseInt(duration) || 0,
      instructor,
      enrolledStudents: 0,
      maxStudents: parseInt(maxStudents) || 0,
      totalLessons: 0,
      completedLessons: 0,
      completionRate: 0,
      pendingSubmissions: 0,
      status,
      coursePassword: body.coursePassword || '',
      allowSelfEnrollment: body.allowSelfEnrollment ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      course: newCourse
    })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create course' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    // TODO: Replace with actual Supabase update
    // const { data: course, error } = await supabase
    //   .from('courses')
    //   .update({
    //     ...updateData,
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('id', id)
    //   .select()
    //   .single()

    // Mock response
    const updatedCourse = {
      id,
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      course: updatedCourse
    })
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update course' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    // TODO: Replace with actual Supabase delete
    // const { error } = await supabase
    //   .from('courses')
    //   .delete()
    //   .eq('id', id)

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}