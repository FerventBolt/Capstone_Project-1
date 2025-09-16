'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Eye, Edit, Users, Clock, BookOpen, CheckCircle, AlertCircle } from 'lucide-react'

interface Course {
  id: string
  title: string
  code: string
  description: string
  category: 'Food & Beverages' | 'Front Office' | 'Housekeeping' | 'Tourism' | 'Cookery'
  level: 'NC I' | 'NC II' | 'NC III'
  duration: number // in hours
  instructor: string
  enrolledStudents: number
  maxStudents: number
  totalLessons: number
  completedLessons: number
  completionRate: number
  pendingSubmissions: number
  status: 'active' | 'inactive' | 'draft'
  coursePassword?: string // Password for student self-enrollment
  allowSelfEnrollment: boolean // Whether students can self-enroll with password
  createdAt: string
  updatedAt: string
}

interface Student {
  id: string
  name: string
  email: string
  studentId: string
}

interface Lesson {
  id: string
  title: string
  description: string
  courseId: string
  lessonNumber: number
  contentType: 'video' | 'text' | 'interactive' | 'mixed'
  durationMinutes: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
  completionRate: number
  studentCount: number
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<Course | null>(null)
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([])
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false)
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: '',
    code: '',
    description: '',
    category: 'Food & Beverages',
    level: 'NC I',
    duration: 40,
    instructor: 'Current Staff',
    maxStudents: 25,
    status: 'draft',
    allowSelfEnrollment: true,
    coursePassword: ''
  })
  const [courseLessons, setCourseLessons] = useState<Array<{
    title: string
    description: string
    content: string
    duration: number
    materials: Array<{
      name: string
      type: 'pdf' | 'video' | 'document' | 'link'
      url: string
      size?: string
    }>
    assignments: Array<{
      title: string
      description: string
      dueDate: string
    }>
  }>>([])
  const [currentStep, setCurrentStep] = useState<'course' | 'lessons'>('course')
  
  // Course content editing state
  const [showContentModal, setShowContentModal] = useState(false)
  const [editingCourseContent, setEditingCourseContent] = useState<Course | null>(null)
  const [editingCourseLessons, setEditingCourseLessons] = useState<Array<{
    id?: string
    title: string
    description: string
    content: string
    duration: number
    materials: Array<{
      name: string
      type: 'pdf' | 'video' | 'document' | 'link'
      url: string
      size?: string
      file?: File
      fileName?: string
    }>
    assignments: Array<{
      id?: string
      title: string
      description: string
      dueDate: string
      status?: 'draft' | 'published'
    }>
  }>>([])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log('🔍 DEBUG: Fetching courses from API and localStorage...')
        
        // Get default courses from API
        const response = await fetch('/api/admin/courses', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        let defaultCourses = []
        if (response.ok) {
          const result = await response.json()
          defaultCourses = result.courses || []
          console.log('🔍 DEBUG: Successfully fetched default courses:', defaultCourses.length)
        } else {
          console.error('🔍 DEBUG: Failed to fetch default courses, using empty array')
        }
        
        // Get user-created courses from localStorage
        let userCreatedCourses = []
        try {
          const storedCourses = localStorage.getItem('demo-courses')
          if (storedCourses) {
            userCreatedCourses = JSON.parse(storedCourses)
            console.log('🔍 DEBUG: Found user-created courses in localStorage:', userCreatedCourses.length)
          }
        } catch (storageError) {
          console.error('🔍 DEBUG: Error reading from localStorage:', storageError)
        }
        
        // Merge default courses with user-created courses and ensure new fields
        const allCourses = [...defaultCourses, ...userCreatedCourses].map(course => ({
          ...course,
          code: course.code || `${course.category?.substring(0,3).toUpperCase()}${Math.floor(Math.random() * 900) + 100}`,
          totalLessons: course.totalLessons || 0,
          completedLessons: course.completedLessons || 0,
          completionRate: course.completionRate || 0,
          pendingSubmissions: course.pendingSubmissions || 0,
          coursePassword: course.coursePassword || '',
          allowSelfEnrollment: course.allowSelfEnrollment ?? true
        }))
        console.log('🔍 DEBUG: Total courses (default + user-created):', allCourses.length)
        
        setCourses(allCourses)
      } catch (error) {
        console.error('Error fetching courses:', error)
        // Fallback: try to load from localStorage only
        try {
          const storedCourses = localStorage.getItem('demo-courses')
          if (storedCourses) {
            const userCourses = JSON.parse(storedCourses).map((course: Course) => ({
              ...course,
              code: course.code || `${course.category?.substring(0,3).toUpperCase()}${Math.floor(Math.random() * 900) + 100}`,
              totalLessons: course.totalLessons || 0,
              completedLessons: course.completedLessons || 0,
              completionRate: course.completionRate || 0,
              pendingSubmissions: course.pendingSubmissions || 0,
              coursePassword: course.coursePassword || '',
              allowSelfEnrollment: course.allowSelfEnrollment ?? true
            }))
            console.log('🔍 DEBUG: Fallback: loaded courses from localStorage only:', userCourses.length)
            setCourses(userCourses)
          } else {
            setCourses([])
          }
        } catch (fallbackError) {
          console.error('🔍 DEBUG: Fallback also failed:', fallbackError)
          setCourses([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Load demo students data
  useEffect(() => {
    const demoStudents: Student[] = [
      { id: '1', name: 'John Doe', email: 'john.doe@email.com', studentId: 'STU001' },
      { id: '2', name: 'Jane Smith', email: 'jane.smith@email.com', studentId: 'STU002' },
      { id: '3', name: 'Mike Johnson', email: 'mike.johnson@email.com', studentId: 'STU003' },
      { id: '4', name: 'Sarah Wilson', email: 'sarah.wilson@email.com', studentId: 'STU004' },
      { id: '5', name: 'David Brown', email: 'david.brown@email.com', studentId: 'STU005' },
    ]
    setAvailableStudents(demoStudents)
  }, [])

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Food & Beverages': return 'bg-blue-100 text-blue-800'
      case 'Front Office': return 'bg-purple-100 text-purple-800'
      case 'Housekeeping': return 'bg-green-100 text-green-800'
      case 'Tourism': return 'bg-orange-100 text-orange-800'
      case 'Cookery': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course)
    setShowDetailsModal(true)
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setShowEditModal(true)
  }

  const handleSaveEdit = (updatedCourse: Course) => {
    const updatedCourses = courses.map(course =>
      course.id === updatedCourse.id ? updatedCourse : course
    )
    setCourses(updatedCourses)
    
    // Save changes to localStorage - only save user-created courses
    try {
      const userCreatedCourses = updatedCourses.filter(course =>
        !['1'].includes(course.id) // Exclude default courses
      )
      localStorage.setItem('demo-courses', JSON.stringify(userCreatedCourses))
      console.log('🔍 DEBUG: Course edit saved to localStorage')
    } catch (storageError) {
      console.error('🔍 DEBUG: Error saving course edit to localStorage:', storageError)
    }
    
    setShowEditModal(false)
    setEditingCourse(null)
    alert('Course updated successfully!')
  }

  const handleDeleteCourse = (courseId: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      const updatedCourses = courses.filter(course => course.id !== courseId)
      setCourses(updatedCourses)
      
      // Save changes to localStorage - only save user-created courses
      try {
        const userCreatedCourses = updatedCourses.filter(course =>
          !['1'].includes(course.id) // Exclude default courses
        )
        localStorage.setItem('demo-courses', JSON.stringify(userCreatedCourses))
        console.log('🔍 DEBUG: Course deletion saved to localStorage')
      } catch (storageError) {
        console.error('🔍 DEBUG: Error saving course deletion to localStorage:', storageError)
      }
      
      setShowDetailsModal(false)
      setSelectedCourse(null)
      alert('Course deleted successfully!')
    }
  }

  const handleManageStudents = (course: Course) => {
    setSelectedCourseForStudents(course)
    
    // Load enrolled students for this course from localStorage
    try {
      const enrollments = JSON.parse(localStorage.getItem('demo-enrollments') || '[]')
      const courseEnrollments = enrollments.filter((e: any) => e.courseId === course.id)
      const enrolled = availableStudents.filter(student =>
        courseEnrollments.some((e: any) => e.studentId === student.id)
      )
      setEnrolledStudents(enrolled)
    } catch (error) {
      console.error('Error loading enrolled students:', error)
      setEnrolledStudents([])
    }
    
    setShowStudentModal(true)
  }

  const handleAddStudent = (student: Student) => {
    if (!selectedCourseForStudents) return
    
    try {
      // Add to enrolled students
      setEnrolledStudents(prev => [...prev, student])
      
      // Update enrollments in localStorage
      const enrollments = JSON.parse(localStorage.getItem('demo-enrollments') || '[]')
      const newEnrollment = {
        id: Date.now().toString(),
        studentId: student.id,
        courseId: selectedCourseForStudents.id,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        progress: 0
      }
      enrollments.push(newEnrollment)
      localStorage.setItem('demo-enrollments', JSON.stringify(enrollments))
      
      // Update course enrolled count
      const updatedCourses = courses.map(course =>
        course.id === selectedCourseForStudents.id
          ? { ...course, enrolledStudents: course.enrolledStudents + 1 }
          : course
      )
      setCourses(updatedCourses)
      
      // Save updated courses
      const userCreatedCourses = updatedCourses.filter(course =>
        !['1'].includes(course.id)
      )
      localStorage.setItem('demo-courses', JSON.stringify(userCreatedCourses))
      
      alert(`${student.name} has been enrolled in the course!`)
    } catch (error) {
      console.error('Error enrolling student:', error)
      alert('Failed to enroll student. Please try again.')
    }
  }

  const handleRemoveStudent = (student: Student) => {
    if (!selectedCourseForStudents) return
    
    try {
      // Remove from enrolled students
      setEnrolledStudents(prev => prev.filter(s => s.id !== student.id))
      
      // Update enrollments in localStorage
      const enrollments = JSON.parse(localStorage.getItem('demo-enrollments') || '[]')
      const updatedEnrollments = enrollments.filter((e: any) =>
        !(e.studentId === student.id && e.courseId === selectedCourseForStudents.id)
      )
      localStorage.setItem('demo-enrollments', JSON.stringify(updatedEnrollments))
      
      // Update course enrolled count
      const updatedCourses = courses.map(course =>
        course.id === selectedCourseForStudents.id
          ? { ...course, enrolledStudents: Math.max(0, course.enrolledStudents - 1) }
          : course
      )
      setCourses(updatedCourses)
      
      // Save updated courses
      const userCreatedCourses = updatedCourses.filter(course =>
        !['1'].includes(course.id)
      )
      localStorage.setItem('demo-courses', JSON.stringify(userCreatedCourses))
      
      alert(`${student.name} has been removed from the course.`)
    } catch (error) {
      console.error('Error removing student:', error)
      alert('Failed to remove student. Please try again.')
    }
  }

  const handleCreateCourse = () => {
    if (!newCourse.title || !newCourse.code || !newCourse.description) {
      alert('Please fill in all required fields.')
      return
    }

    const courseId = Date.now().toString()
    const course: Course = {
      id: courseId,
      title: newCourse.title,
      code: newCourse.code,
      description: newCourse.description,
      category: newCourse.category || 'Food & Beverages',
      level: newCourse.level || 'NC I',
      duration: newCourse.duration || 40,
      instructor: newCourse.instructor || 'Current Staff',
      enrolledStudents: 0,
      maxStudents: newCourse.maxStudents || 25,
      totalLessons: courseLessons.length,
      completedLessons: 0,
      completionRate: 0,
      pendingSubmissions: courseLessons.reduce((acc, lesson) => acc + lesson.assignments.length, 0),
      status: newCourse.status || 'draft',
      coursePassword: newCourse.coursePassword || '',
      allowSelfEnrollment: newCourse.allowSelfEnrollment ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Create lessons for the course
    const newLessons: Lesson[] = courseLessons.map((lessonData, index) => ({
      id: `${courseId}-lesson-${index + 1}`,
      title: lessonData.title,
      description: lessonData.description,
      courseId: courseId,
      lessonNumber: index + 1,
      contentType: 'mixed' as const,
      durationMinutes: lessonData.duration,
      isPublished: course.status === 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completionRate: 0,
      studentCount: 0
    }))

    setCourses(prev => [...prev, course])
    setLessons(prev => [...prev, ...newLessons])
    
    // Save to localStorage
    try {
      const userCreatedCourses = [...courses, course].filter(course =>
        !['1'].includes(course.id) // Exclude default courses
      )
      localStorage.setItem('demo-courses', JSON.stringify(userCreatedCourses))
    } catch (storageError) {
      console.error('Error saving course to localStorage:', storageError)
    }
    
    // Reset form
    setNewCourse({
      title: '',
      code: '',
      description: '',
      category: 'Food & Beverages',
      level: 'NC I',
      duration: 40,
      instructor: 'Current Staff',
      maxStudents: 25,
      status: 'draft',
      allowSelfEnrollment: true,
      coursePassword: ''
    })
    setCourseLessons([])
    setCurrentStep('course')
    setShowCreateCourseModal(false)
    alert('Course created successfully with lessons and materials!')
  }

  const addLesson = () => {
    setCourseLessons(prev => [...prev, {
      title: '',
      description: '',
      content: '',
      duration: 45,
      materials: [],
      assignments: []
    }])
  }

  const updateLesson = (index: number, field: string, value: any) => {
    setCourseLessons(prev => prev.map((lesson, i) =>
      i === index ? { ...lesson, [field]: value } : lesson
    ))
  }

  const removeLesson = (index: number) => {
    setCourseLessons(prev => prev.filter((_, i) => i !== index))
  }

  const addMaterial = (lessonIndex: number) => {
    setCourseLessons(prev => prev.map((lesson, i) =>
      i === lessonIndex ? {
        ...lesson,
        materials: [...lesson.materials, { name: '', type: 'pdf' as const, url: '', size: '' }]
      } : lesson
    ))
  }

  const updateMaterial = (lessonIndex: number, materialIndex: number, field: string, value: any) => {
    setCourseLessons(prev => prev.map((lesson, i) =>
      i === lessonIndex ? {
        ...lesson,
        materials: lesson.materials.map((material, j) =>
          j === materialIndex ? { ...material, [field]: value } : material
        )
      } : lesson
    ))
  }

  const removeMaterial = (lessonIndex: number, materialIndex: number) => {
    setCourseLessons(prev => prev.map((lesson, i) =>
      i === lessonIndex ? {
        ...lesson,
        materials: lesson.materials.filter((_, j) => j !== materialIndex)
      } : lesson
    ))
  }

  const addAssignment = (lessonIndex: number) => {
    setCourseLessons(prev => prev.map((lesson, i) =>
      i === lessonIndex ? {
        ...lesson,
        assignments: [...lesson.assignments, {
          title: '',
          description: '',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }]
      } : lesson
    ))
  }

  const updateAssignment = (lessonIndex: number, assignmentIndex: number, field: string, value: any) => {
    setCourseLessons(prev => prev.map((lesson, i) =>
      i === lessonIndex ? {
        ...lesson,
        assignments: lesson.assignments.map((assignment, j) =>
          j === assignmentIndex ? { ...assignment, [field]: value } : assignment
        )
      } : lesson
    ))
  }

  const removeAssignment = (lessonIndex: number, assignmentIndex: number) => {
    setCourseLessons(prev => prev.map((lesson, i) =>
      i === lessonIndex ? {
        ...lesson,
        assignments: lesson.assignments.filter((_, j) => j !== assignmentIndex)
      } : lesson
    ))
  }

  // Course content editing handlers
  const handleManageContent = (course: Course) => {
    setEditingCourseContent(course)
    
    // Load existing lessons for this course from localStorage
    try {
      const storedLessons = localStorage.getItem(`course-${course.id}-lessons`)
      if (storedLessons) {
        const lessons = JSON.parse(storedLessons)
        setEditingCourseLessons(lessons)
      } else {
        // Generate sample lessons if none exist
        const sampleLessons = generateSampleLessons(course.category)
        setEditingCourseLessons(sampleLessons)
      }
    } catch (error) {
      console.error('Error loading course lessons:', error)
      setEditingCourseLessons([])
    }
    
    setShowContentModal(true)
  }

  const generateSampleLessons = (category: string) => {
    const lessonTemplates = {
      'Food & Beverages': [
        { title: 'Introduction to Food Service', description: 'Basic principles of food service operations', content: 'Learn the fundamentals of food service including hygiene, safety, and customer service.' },
        { title: 'Menu Planning', description: 'Creating balanced and appealing menus', content: 'Understand menu design, cost control, and nutritional considerations.' }
      ],
      'Front Office': [
        { title: 'Guest Check-in Procedures', description: 'Standard operating procedures for guest arrival', content: 'Master the check-in process, room assignment, and guest communication.' },
        { title: 'Reservation Management', description: 'Managing bookings and availability', content: 'Learn reservation systems, overbooking strategies, and guest preferences.' }
      ],
      'Housekeeping': [
        { title: 'Room Cleaning Standards', description: 'Maintaining cleanliness and hygiene standards', content: 'Detailed procedures for room cleaning, sanitization, and quality control.' },
        { title: 'Inventory Management', description: 'Managing housekeeping supplies and equipment', content: 'Track supplies, manage inventory levels, and maintain equipment.' }
      ],
      'Tourism': [
        { title: 'Destination Knowledge', description: 'Understanding local attractions and culture', content: 'Comprehensive overview of local tourism assets and cultural heritage.' },
        { title: 'Tour Guiding Techniques', description: 'Professional tour guiding skills', content: 'Communication skills, group management, and storytelling techniques.' }
      ],
      'Cookery': [
        { title: 'Basic Cooking Techniques', description: 'Fundamental cooking methods and skills', content: 'Master basic cooking techniques including sautéing, braising, and grilling.' },
        { title: 'Food Safety and Hygiene', description: 'Safe food handling practices', content: 'Critical food safety principles, HACCP, and hygiene standards.' }
      ]
    }

    const templates = lessonTemplates[category as keyof typeof lessonTemplates] || lessonTemplates['Food & Beverages']
    
    return templates.map((template, index) => ({
      id: `lesson-${Date.now()}-${index}`,
      title: template.title,
      description: template.description,
      content: template.content,
      duration: 45,
      materials: [
        { name: 'Lesson Slides', type: 'pdf' as const, url: '/materials/slides.pdf' },
        { name: 'Reference Guide', type: 'document' as const, url: '/materials/guide.docx' }
      ],
      assignments: [
        {
          id: `assignment-${Date.now()}-${index}`,
          title: `${template.title} Assignment`,
          description: `Complete the practical exercise for ${template.title.toLowerCase()}`,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'published' as const
        }
      ]
    }))
  }

  const addEditingLesson = () => {
    setEditingCourseLessons(prev => [...prev, {
      id: `lesson-${Date.now()}`,
      title: '',
      description: '',
      content: '',
      duration: 45,
      materials: [],
      assignments: []
    }])
  }

  const updateEditingLesson = (index: number, field: string, value: any) => {
    setEditingCourseLessons(prev => prev.map((lesson, i) =>
      i === index ? { ...lesson, [field]: value } : lesson
    ))
  }

  const removeEditingLesson = (index: number) => {
    setEditingCourseLessons(prev => prev.filter((_, i) => i !== index))
  }

  const addEditingMaterial = (lessonIndex: number) => {
    setEditingCourseLessons(prev => prev.map((lesson, i) =>
      i === lessonIndex ? {
        ...lesson,
        materials: [...lesson.materials, { name: '', type: 'pdf' as const, url: '', size: '' }]
      } : lesson
    ))
  }

  const updateEditingMaterial = (lessonIndex: number, materialIndex: number, field: string, value: any) => {
    setEditingCourseLessons(prev => prev.map((lesson, i) =>
      i === lessonIndex ? {
        ...lesson,
        materials: lesson.materials.map((material, j) =>
          j === materialIndex ? { ...material, [field]: value } : material
        )
      } : lesson
    ))
  }

  const removeEditingMaterial = (lessonIndex: number, materialIndex: number) => {
    setEditingCourseLessons(prev => prev.map((lesson, i) =>
      i === lessonIndex ? {
        ...lesson,
        materials: lesson.materials.filter((_, j) => j !== materialIndex)
      } : lesson
    ))
  }

  const addEditingAssignment = (lessonIndex: number) => {
    setEditingCourseLessons(prev => prev.map((lesson, i) =>
      i === lessonIndex ? {
        ...lesson,
        assignments: [...lesson.assignments, {
          id: `assignment-${Date.now()}`,
          title: '',
          description: '',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'draft' as const
        }]
      } : lesson
    ))
  }

  const updateEditingAssignment = (lessonIndex: number, assignmentIndex: number, field: string, value: any) => {
    setEditingCourseLessons(prev => prev.map((lesson, i) =>
      i === lessonIndex ? {
        ...lesson,
        assignments: lesson.assignments.map((assignment, j) =>
          j === assignmentIndex ? { ...assignment, [field]: value } : assignment
        )
      } : lesson
    ))
  }

  const removeEditingAssignment = (lessonIndex: number, assignmentIndex: number) => {
    setEditingCourseLessons(prev => prev.map((lesson, i) =>
      i === lessonIndex ? {
        ...lesson,
        assignments: lesson.assignments.filter((_, j) => j !== assignmentIndex)
      } : lesson
    ))
  }

  const handleFileUpload = (lessonIndex: number, materialIndex: number, file: File) => {
    // Create a URL for the file (in a real app, you'd upload to a server)
    const fileUrl = URL.createObjectURL(file)
    const fileSizeKB = Math.round(file.size / 1024)
    const fileSizeMB = fileSizeKB > 1024 ? `${(fileSizeKB / 1024).toFixed(1)}MB` : `${fileSizeKB}KB`
    
    setEditingCourseLessons(prev => prev.map((lesson, i) =>
      i === lessonIndex ? {
        ...lesson,
        materials: lesson.materials.map((material, j) =>
          j === materialIndex ? {
            ...material,
            file: file,
            fileName: file.name,
            url: fileUrl,
            size: fileSizeMB,
            name: material.name || file.name.split('.')[0] // Use filename as name if not set
          } : material
        )
      } : lesson
    ))
  }

  const getAcceptedFileTypes = (materialType: string) => {
    switch (materialType) {
      case 'pdf':
        return '.pdf'
      case 'video':
        return '.mp4,.avi,.mov,.wmv,.flv,.webm'
      case 'document':
        return '.doc,.docx,.txt,.rtf,.odt'
      case 'link':
        return '' // No file upload for links
      default:
        return '*'
    }
  }

  const getFileTypeIcon = (materialType: string) => {
    switch (materialType) {
      case 'pdf':
        return '📄'
      case 'video':
        return '🎥'
      case 'document':
        return '📝'
      case 'link':
        return '🔗'
      default:
        return '📎'
    }
  }

  const handleSaveContent = () => {
    if (!editingCourseContent) return

    try {
      // Save lessons to localStorage
      localStorage.setItem(`course-${editingCourseContent.id}-lessons`, JSON.stringify(editingCourseLessons))
      
      // Update course statistics
      const totalAssignments = editingCourseLessons.reduce((acc, lesson) => acc + lesson.assignments.length, 0)
      const updatedCourse = {
        ...editingCourseContent,
        totalLessons: editingCourseLessons.length,
        pendingSubmissions: totalAssignments,
        updatedAt: new Date().toISOString()
      }

      // Update courses list
      const updatedCourses = courses.map(course =>
        course.id === editingCourseContent.id ? updatedCourse : course
      )
      setCourses(updatedCourses)

      // Save updated courses to localStorage
      const userCreatedCourses = updatedCourses.filter(course =>
        !['1'].includes(course.id) // Exclude default courses
      )
      localStorage.setItem('demo-courses', JSON.stringify(userCreatedCourses))

      setShowContentModal(false)
      setEditingCourseContent(null)
      setEditingCourseLessons([])
      alert('Course content updated successfully!')
    } catch (error) {
      console.error('Error saving course content:', error)
      alert('Failed to save course content. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-600 mt-2">Manage all courses and training programs</p>
          </div>
          <button
            onClick={() => setShowCreateCourseModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            {/*  - Lucide icon type issue with strict TypeScript */}
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Courses</label>
            <input
              type="text"
              placeholder="Search by title, description, or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              <option value="Food & Beverages">Food & Beverages</option>
              <option value="Front Office">Front Office</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Tourism">Tourism</option>
              <option value="Cookery">Cookery</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(course.category)}`}>
                    {course.category}
                  </span>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    {course.level}
                  </span>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                {course.status}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Instructor:</span>
                <span className="font-medium">{course.instructor}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium">{course.duration} hours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Enrollment:</span>
                <span className="font-medium">{course.enrolledStudents}/{course.maxStudents}</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(course.enrolledStudents / course.maxStudents) * 100}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() => handleViewDetails(course)}
                className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => handleEditCourse(course)}
                className="text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
              >
                Edit Course
              </button>
              <Link
                href={`/admin/courses/${course.id}`}
                className="text-sm bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-2 rounded-lg transition-colors inline-block text-center"
              >
                Manage Content
              </Link>
              <button
                onClick={() => handleManageStudents(course)}
                className="text-sm bg-green-50 text-green-600 hover:bg-green-100 px-3 py-2 rounded-lg transition-colors"
              >
                Manage Students
              </button>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => handleDeleteCourse(course.id)}
                className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
                title="Delete Course"
              >
                🗑️ Delete Course
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Course Details Modal */}
      {showDetailsModal && selectedCourse && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Course Details: {selectedCourse.title}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900 mt-1">{selectedCourse.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedCourse.category)} mt-1`}>
                    {selectedCourse.category}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Level</label>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 mt-1">
                    {selectedCourse.level}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedCourse.duration} hours</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Instructor</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedCourse.instructor}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enrollment</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedCourse.enrolledStudents}/{selectedCourse.maxStudents} students</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCourse.status)} mt-1`}>
                    {selectedCourse.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900 mt-1">{new Date(selectedCourse.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-sm text-gray-900 mt-1">{new Date(selectedCourse.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => handleDeleteCourse(selectedCourse.id)}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
              >
                Delete Course
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedCourse(null)
                }}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Course: {editingCourse.title}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              handleSaveEdit(editingCourse)
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                <input
                  type="text"
                  required
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="input-field"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    required
                    value={editingCourse.category}
                    onChange={(e) => setEditingCourse(prev => prev ? { ...prev, category: e.target.value as any } : null)}
                    className="input-field"
                  >
                    <option value="Food & Beverages">Food & Beverages</option>
                    <option value="Front Office">Front Office</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Tourism">Tourism</option>
                    <option value="Cookery">Cookery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <select
                    required
                    value={editingCourse.level}
                    onChange={(e) => setEditingCourse(prev => prev ? { ...prev, level: e.target.value as any } : null)}
                    className="input-field"
                  >
                    <option value="NC I">NC I</option>
                    <option value="NC II">NC II</option>
                    <option value="NC III">NC III</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingCourse.duration}
                    onChange={(e) => setEditingCourse(prev => prev ? { ...prev, duration: parseInt(e.target.value) || 0 } : null)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingCourse.maxStudents}
                    onChange={(e) => setEditingCourse(prev => prev ? { ...prev, maxStudents: parseInt(e.target.value) || 0 } : null)}
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.instructor}
                    onChange={(e) => setEditingCourse(prev => prev ? { ...prev, instructor: e.target.value } : null)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    required
                    value={editingCourse.status}
                    onChange={(e) => setEditingCourse(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    className="input-field"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              
              {/* Course Access Settings */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Course Access Settings</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowSelfEnrollment"
                      checked={editingCourse.allowSelfEnrollment}
                      onChange={(e) => setEditingCourse(prev => prev ? { ...prev, allowSelfEnrollment: e.target.checked } : null)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="allowSelfEnrollment" className="ml-2 block text-sm text-gray-900">
                      Allow students to self-enroll with password
                    </label>
                  </div>
                  
                  {editingCourse.allowSelfEnrollment && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course Password</label>
                      <input
                        type="text"
                        placeholder="Enter password for student enrollment"
                        value={editingCourse.coursePassword || ''}
                        onChange={(e) => setEditingCourse(prev => prev ? { ...prev, coursePassword: e.target.value } : null)}
                        className="input-field"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Students will need this password to enroll in the course
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingCourse(null)
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Management Modal */}
      {showStudentModal && selectedCourseForStudents && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Manage Students: {selectedCourseForStudents.title}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Available Students */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Available Students</h4>
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  {availableStudents
                    .filter(student => !enrolledStudents.some(enrolled => enrolled.id === student.id))
                    .map(student => (
                    <div key={student.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                        <p className="text-xs text-gray-400">ID: {student.studentId}</p>
                      </div>
                      <button
                        onClick={() => handleAddStudent(student)}
                        className="bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1 rounded text-sm transition-colors"
                        disabled={selectedCourseForStudents.enrolledStudents >= selectedCourseForStudents.maxStudents}
                      >
                        Add
                      </button>
                    </div>
                  ))}
                  {availableStudents.filter(student => !enrolledStudents.some(enrolled => enrolled.id === student.id)).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No available students</p>
                  )}
                </div>
              </div>
              
              {/* Enrolled Students */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Enrolled Students ({enrolledStudents.length}/{selectedCourseForStudents.maxStudents})
                </h4>
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  {enrolledStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                        <p className="text-xs text-gray-400">ID: {student.studentId}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(student)}
                        className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded text-sm transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {enrolledStudents.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No enrolled students</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Course Password: <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  {selectedCourseForStudents.coursePassword || 'Not set'}
                </span>
                {selectedCourseForStudents.allowSelfEnrollment ? (
                  <span className="ml-2 text-green-600">✓ Self-enrollment enabled</span>
                ) : (
                  <span className="ml-2 text-red-600">✗ Self-enrollment disabled</span>
                )}
              </div>
              <button
                onClick={() => {
                  setShowStudentModal(false)
                  setSelectedCourseForStudents(null)
                  setEnrolledStudents([])
                }}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Create New Course
              </h3>
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-sm ${
                  currentStep === 'course' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  1. Course Info
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  currentStep === 'lessons' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  2. Lessons & Content
                </div>
              </div>
            </div>

            {currentStep === 'course' && (
              <form onSubmit={(e) => {
                e.preventDefault()
                if (!newCourse.title || !newCourse.code || !newCourse.description) {
                  alert('Please fill in all required fields.')
                  return
                }
                setCurrentStep('lessons')
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                    <input
                      type="text"
                      required
                      value={newCourse.title || ''}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                      className="input-field"
                      placeholder="Enter course title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
                    <input
                      type="text"
                      required
                      value={newCourse.code || ''}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, code: e.target.value }))}
                      className="input-field"
                      placeholder="Enter course code (e.g., RSO101)"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={newCourse.description || ''}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field"
                    placeholder="Enter course description"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      required
                      value={newCourse.category || 'Food & Beverages'}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, category: e.target.value as any }))}
                      className="input-field"
                    >
                      <option value="Food & Beverages">Food & Beverages</option>
                      <option value="Front Office">Front Office</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Tourism">Tourism</option>
                      <option value="Cookery">Cookery</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                    <select
                      required
                      value={newCourse.level || 'NC I'}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, level: e.target.value as any }))}
                      className="input-field"
                    >
                      <option value="NC I">NC I</option>
                      <option value="NC II">NC II</option>
                      <option value="NC III">NC III</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      required
                      value={newCourse.status || 'draft'}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, status: e.target.value as any }))}
                      className="input-field"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newCourse.duration || 40}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, duration: parseInt(e.target.value) || 40 }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newCourse.maxStudents || 25}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, maxStudents: parseInt(e.target.value) || 25 }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                    <input
                      type="text"
                      required
                      value={newCourse.instructor || 'Current Staff'}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, instructor: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                </div>
                
                {/* Course Access Settings */}
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Course Access Settings</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="newCourseAllowSelfEnrollment"
                        checked={newCourse.allowSelfEnrollment ?? true}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, allowSelfEnrollment: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="newCourseAllowSelfEnrollment" className="ml-2 block text-sm text-gray-900">
                        Allow students to self-enroll with password
                      </label>
                    </div>
                    
                    {newCourse.allowSelfEnrollment && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course Password</label>
                        <input
                          type="text"
                          placeholder="Enter password for student enrollment"
                          value={newCourse.coursePassword || ''}
                          onChange={(e) => setNewCourse(prev => ({ ...prev, coursePassword: e.target.value }))}
                          className="input-field"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Students will need this password to enroll in the course
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Next: Add Lessons →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateCourseModal(false)
                      setNewCourse({
                        title: '',
                        code: '',
                        description: '',
                        category: 'Food & Beverages',
                        level: 'NC I',
                        duration: 40,
                        instructor: 'Current Staff',
                        maxStudents: 25,
                        status: 'draft',
                        allowSelfEnrollment: true,
                        coursePassword: ''
                      })
                      setCourseLessons([])
                      setCurrentStep('course')
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {currentStep === 'lessons' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">Course Lessons & Content</h4>
                  <button
                    onClick={addLesson}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                  >
                    {/*  - Lucide icon type issue with strict TypeScript */}
                    <Plus className="w-4 h-4" />
                    <span>Add Lesson</span>
                  </button>
                </div>

                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {courseLessons.map((lesson, lessonIndex) => (
                    <div key={lessonIndex} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-md font-medium text-gray-900">Lesson {lessonIndex + 1}</h5>
                        <button
                          onClick={() => removeLesson(lessonIndex)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => updateLesson(lessonIndex, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Enter lesson title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                          <input
                            type="number"
                            min="1"
                            value={lesson.duration}
                            onChange={(e) => updateLesson(lessonIndex, 'duration', parseInt(e.target.value) || 45)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={lesson.description}
                          onChange={(e) => updateLesson(lessonIndex, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Enter lesson description"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <textarea
                          rows={3}
                          value={lesson.content}
                          onChange={(e) => updateLesson(lessonIndex, 'content', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Enter lesson content and learning objectives"
                        />
                      </div>

                      {/* Materials Section */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">Materials</label>
                          <button
                            onClick={() => addMaterial(lessonIndex)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            + Add Material
                          </button>
                        </div>
                        <div className="space-y-2">
                          {lesson.materials.map((material, materialIndex) => (
                            <div key={materialIndex} className="bg-gray-50 p-3 rounded border">
                              <div className="grid grid-cols-3 gap-2 mb-2">
                                <input
                                  type="text"
                                  value={material.name}
                                  onChange={(e) => updateMaterial(lessonIndex, materialIndex, 'name', e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="Material name"
                                />
                                <select
                                  value={material.type}
                                  onChange={(e) => updateMaterial(lessonIndex, materialIndex, 'type', e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                                >
                                  <option value="pdf">PDF</option>
                                  <option value="video">Video</option>
                                  <option value="document">Document</option>
                                  <option value="link">Link</option>
                                </select>
                                <button
                                  onClick={() => removeMaterial(lessonIndex, materialIndex)}
                                  className="text-red-600 hover:text-red-700 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                              
                              {material.type === 'link' ? (
                                <input
                                  type="url"
                                  value={material.url}
                                  onChange={(e) => updateMaterial(lessonIndex, materialIndex, 'url', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="Enter URL (e.g., https://example.com)"
                                />
                              ) : (
                                <div className="space-y-1">
                                  <label className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-100 transition-colors">
                                    <span className="text-sm text-gray-600 mr-2">{getFileTypeIcon(material.type)}</span>
                                    <span className="text-sm text-gray-600">Upload File</span>
                                    <input
                                      type="file"
                                      accept={getAcceptedFileTypes(material.type)}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                          const fileUrl = URL.createObjectURL(file)
                                          const fileSizeKB = Math.round(file.size / 1024)
                                          const fileSizeMB = fileSizeKB > 1024 ? `${(fileSizeKB / 1024).toFixed(1)}MB` : `${fileSizeKB}KB`
                                          updateMaterial(lessonIndex, materialIndex, 'url', fileUrl)
                                          updateMaterial(lessonIndex, materialIndex, 'size', fileSizeMB)
                                          if (!material.name) {
                                            updateMaterial(lessonIndex, materialIndex, 'name', file.name.split('.')[0])
                                          }
                                        }
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                  {material.url && (
                                    <div className="text-xs text-green-600 bg-green-50 p-1 rounded">
                                      ✓ File selected
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Assignments Section */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">Assignments</label>
                          <button
                            onClick={() => addAssignment(lessonIndex)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            + Add Assignment
                          </button>
                        </div>
                        <div className="space-y-2">
                          {lesson.assignments.map((assignment, assignmentIndex) => (
                            <div key={assignmentIndex} className="grid grid-cols-4 gap-2 items-center">
                              <input
                                type="text"
                                value={assignment.title}
                                onChange={(e) => updateAssignment(lessonIndex, assignmentIndex, 'title', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Assignment title"
                              />
                              <input
                                type="text"
                                value={assignment.description}
                                onChange={(e) => updateAssignment(lessonIndex, assignmentIndex, 'description', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Assignment description"
                              />
                              <input
                                type="date"
                                value={assignment.dueDate}
                                onChange={(e) => updateAssignment(lessonIndex, assignmentIndex, 'dueDate', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <button
                                onClick={() => removeAssignment(lessonIndex, assignmentIndex)}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {courseLessons.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No lessons added yet. Click "Add Lesson" to create your first lesson.</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setCurrentStep('course')}
                    className="btn-secondary"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleCreateCourse}
                    className="btn-primary flex-1"
                  >
                    Create Course with {courseLessons.length} Lesson{courseLessons.length !== 1 ? 's' : ''}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateCourseModal(false)
                      setNewCourse({
                        title: '',
                        code: '',
                        description: '',
                        category: 'Food & Beverages',
                        level: 'NC I',
                        duration: 40,
                        instructor: 'Current Staff',
                        maxStudents: 25,
                        status: 'draft',
                        allowSelfEnrollment: true,
                        coursePassword: ''
                      })
                      setCourseLessons([])
                      setCurrentStep('course')
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Course Content Management Modal */}
      {showContentModal && editingCourseContent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Manage Course Content: {editingCourseContent.title}
              </h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {editingCourseLessons.length} Lesson{editingCourseLessons.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={addEditingLesson}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                >
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <Plus className="w-4 h-4" />
                  <span>Add Lesson</span>
                </button>
              </div>
            </div>

            <div className="space-y-6 max-h-96 overflow-y-auto mb-6">
              {editingCourseLessons.map((lesson, lessonIndex) => (
                <div key={lessonIndex} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Lesson {lessonIndex + 1}</h4>
                    <button
                      onClick={() => removeEditingLesson(lessonIndex)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove Lesson
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Title</label>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => updateEditingLesson(lessonIndex, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter lesson title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        min="1"
                        value={lesson.duration}
                        onChange={(e) => updateEditingLesson(lessonIndex, 'duration', parseInt(e.target.value) || 45)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={2}
                      value={lesson.description}
                      onChange={(e) => updateEditingLesson(lessonIndex, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter lesson description"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      rows={4}
                      value={lesson.content}
                      onChange={(e) => updateEditingLesson(lessonIndex, 'content', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter lesson content and learning objectives"
                    />
                  </div>

                  {/* Materials Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-md font-medium text-gray-900">Materials</h5>
                      <button
                        onClick={() => addEditingMaterial(lessonIndex)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Material
                      </button>
                    </div>
                    <div className="space-y-3">
                      {lesson.materials.map((material, materialIndex) => (
                        <div key={materialIndex} className="bg-white p-4 rounded border">
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <input
                              type="text"
                              value={material.name}
                              onChange={(e) => updateEditingMaterial(lessonIndex, materialIndex, 'name', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Material name"
                            />
                            <select
                              value={material.type}
                              onChange={(e) => updateEditingMaterial(lessonIndex, materialIndex, 'type', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="pdf">PDF</option>
                              <option value="video">Video</option>
                              <option value="document">Document</option>
                              <option value="link">Link</option>
                            </select>
                            <button
                              onClick={() => removeEditingMaterial(lessonIndex, materialIndex)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                          
                          {material.type === 'link' ? (
                            <input
                              type="url"
                              value={material.url}
                              onChange={(e) => updateEditingMaterial(lessonIndex, materialIndex, 'url', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Enter URL (e.g., https://example.com)"
                            />
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-3">
                                <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                                  <span className="text-sm text-gray-600 mr-2">{getFileTypeIcon(material.type)}</span>
                                  <span className="text-sm text-gray-600">
                                    {material.fileName ? 'Change File' : 'Upload File'}
                                  </span>
                                  <input
                                    type="file"
                                    accept={getAcceptedFileTypes(material.type)}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        handleFileUpload(lessonIndex, materialIndex, file)
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                                {material.fileName && (
                                  <div className="flex-1 text-sm text-gray-600">
                                    <span className="font-medium">{material.fileName}</span>
                                    {material.size && <span className="text-gray-400 ml-2">({material.size})</span>}
                                  </div>
                                )}
                              </div>
                              {material.fileName && (
                                <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                                  ✓ File uploaded successfully
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {lesson.materials.length === 0 && (
                        <p className="text-gray-500 text-sm italic">No materials added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Assignments Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-md font-medium text-gray-900">Assignments</h5>
                      <button
                        onClick={() => addEditingAssignment(lessonIndex)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Assignment
                      </button>
                    </div>
                    <div className="space-y-3">
                      {lesson.assignments.map((assignment, assignmentIndex) => (
                        <div key={assignmentIndex} className="bg-white p-4 rounded border">
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <input
                              type="text"
                              value={assignment.title}
                              onChange={(e) => updateEditingAssignment(lessonIndex, assignmentIndex, 'title', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Assignment title"
                            />
                            <input
                              type="date"
                              value={assignment.dueDate}
                              onChange={(e) => updateEditingAssignment(lessonIndex, assignmentIndex, 'dueDate', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <select
                              value={assignment.status || 'draft'}
                              onChange={(e) => updateEditingAssignment(lessonIndex, assignmentIndex, 'status', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                            </select>
                          </div>
                          <textarea
                            rows={2}
                            value={assignment.description}
                            onChange={(e) => updateEditingAssignment(lessonIndex, assignmentIndex, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-3"
                            placeholder="Assignment description"
                          />
                          <div className="flex justify-between items-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              assignment.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {assignment.status === 'published' ? 'Published' : 'Draft'}
                            </span>
                            <button
                              onClick={() => removeEditingAssignment(lessonIndex, assignmentIndex)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Remove Assignment
                            </button>
                          </div>
                        </div>
                      ))}
                      {lesson.assignments.length === 0 && (
                        <p className="text-gray-500 text-sm italic">No assignments added yet</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {editingCourseLessons.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
                  <p className="text-gray-500">Click "Add Lesson" to create your first lesson.</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4 border-t">
              <button
                onClick={handleSaveContent}
                className="btn-primary flex-1"
              >
                Save Content Changes
              </button>
              <button
                onClick={() => {
                  setShowContentModal(false)
                  setEditingCourseContent(null)
                  setEditingCourseLessons([])
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}