'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Save, Eye, FileText, Upload, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase/supabase-client'
import { uploadMaterialFile, deleteMaterialFile } from '@/lib/upload-file'

interface Lesson {
  id: string
  title: string
  description: string
  content: string
  duration: number
  materials: Material[]
  assignments: Assignment[]
  order: number
  isPublished: boolean
}

interface Material {
  id: string
  name: string
  type: 'pdf' | 'video' | 'document' | 'link' | 'image'
  url: string
  size?: string
  fileName?: string
  file?: File
}

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  status: 'draft' | 'published'
  maxPoints: number
  instructions: string
}

interface Submission {
  id: string
  studentId: string
  studentName: string
  submittedAt: string
  content: string
  fileName?: string
  status: 'submitted' | 'graded' | 'returned'
  grade?: number
  feedback?: string
}

export default function ContentManagePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'content' | 'materials' | 'assignments' | 'submissions'>('content')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(null)
  const [gradeForm, setGradeForm] = useState({ grade: 0, feedback: '' })

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        // Fetch lesson from Supabase
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .eq('course_id', courseId)
          .single()

        if (lessonError || !lessonData) {
          console.error('Error fetching lesson:', lessonError)
          router.push(`/admin/courses/${courseId}`)
          return
        }

        // Fetch materials for this lesson
        const { data: materialsData } = await supabase
          .from('materials')
          .select('*')
          .eq('lesson_id', lessonId)

        // Fetch assignments for this course
        const { data: assignmentsData } = await supabase
          .from('assignments')
          .select('*')
          .eq('course_id', courseId)

        setLesson({
          id: lessonData.id,
          title: lessonData.title,
          description: lessonData.description || '',
          content: lessonData.content || '',
          duration: lessonData.duration || 0,
          materials: (materialsData || []).map((m: any) => ({
            id: m.id,
            name: m.name,
            type: m.type,
            url: m.url,
            size: m.size,
            fileName: m.file_name
          })),
          assignments: (assignmentsData || []).map((a: any) => ({
            id: a.id,
            title: a.title,
            description: a.description || '',
            dueDate: a.due_date,
            status: 'draft',
            maxPoints: 100,
            instructions: ''
          })),
          order: 0,
          isPublished: false
        })

        // Fetch submissions from Supabase
        if (assignmentsData && assignmentsData.length > 0) {
          const { data: submissionsData } = await supabase
            .from('submissions')
            .select(`
              *,
              profiles:student_id (
                id,
                email,
                full_name
              )
            `)
            .in('assignment_id', assignmentsData.map((a: any) => a.id))

          if (submissionsData) {
            setSubmissions(submissionsData.map((sub: any) => ({
              id: sub.id,
              studentId: sub.student_id,
              studentName: sub.profiles?.full_name || 'Unknown',
              submittedAt: sub.submitted_at,
              content: '',
              fileName: undefined,
              status: sub.status || 'submitted',
              grade: sub.grade,
              feedback: undefined
            })))
          }
        }

      } catch (error) {
        console.error('Error fetching lesson data:', error)
        router.push(`/admin/courses/${courseId}`)
      } finally {
        setLoading(false)
      }
    }

    fetchLessonData()
  }, [courseId, lessonId, router])

  const handleSaveLesson = async () => {
    if (!lesson) return

    console.log('Saving lesson with materials:', lesson.materials.map(m => ({
      id: m.id,
      name: m.name,
      hasFile: !!m.file,
      fileName: m.fileName,
      url: m.url
    })))

    try {
      // Update lesson
      const { error: lessonError } = await supabase
        .from('lessons')
        .update({
          title: lesson.title,
          description: lesson.description,
          content: lesson.content,
          duration: lesson.duration
        })
        .eq('id', lessonId)

      if (lessonError) {
        alert('Error saving lesson: ' + lessonError.message)
        return
      }

      // Save/update materials
      const newMaterials = []
      const existingMaterials = []
      
      for (const material of lesson.materials) {
        if (material.id.startsWith('material-')) {
          // New material - upload file if exists
          let finalUrl = material.url
          
          if (material.file && material.type !== 'link') {
            const { url, error } = await uploadMaterialFile(material.file, lessonId)
            if (error) {
              console.error('Error uploading file:', error)
              continue
            }
            finalUrl = url
          }
          
          newMaterials.push({
            lesson_id: lessonId,
            name: material.name,
            type: material.type,
            url: finalUrl,
            size: material.size || null,
            file_name: material.fileName || null
          })
        } else {
          // Existing material - check if there's a new file to upload
          let finalUrl = material.url
          let finalSize = material.size
          let finalFileName = material.fileName
          
          console.log('Processing existing material:', {
            id: material.id,
            hasFile: !!material.file,
            type: material.type,
            fileName: material.fileName,
            url: material.url,
            isBlobUrl: material.url?.startsWith('blob:')
          })
          
          // Check if there's a new file (blob URL indicates file was selected but not uploaded yet)
          // OR if file object exists (user selected a new file)
          const needsUpload = (material.file && material.type !== 'link') || (material.url?.startsWith('blob:'))
          
          if (needsUpload) {
            if (!material.file) {
              console.error('File object missing but blob URL detected for:', material.id)
              alert(`Error: File data missing for ${material.name}. Please re-select the file.`)
              continue
            }
            
            console.log('Uploading new file for existing material:', material.fileName)
            const { url, error } = await uploadMaterialFile(material.file, lessonId)
            if (error) {
              console.error('Error uploading file:', error)
              alert(`Error uploading ${material.fileName}: ${error}`)
              continue
            } else {
              console.log('File uploaded successfully:', url)
              finalUrl = url
              finalSize = material.size
              finalFileName = material.fileName
            }
          }
          
          existingMaterials.push({
            id: material.id,
            name: material.name,
            type: material.type,
            url: finalUrl,
            size: finalSize || null,
            file_name: finalFileName || null
          })
        }
      }
      
      // Insert new materials via API
      if (newMaterials.length > 0) {
        const response = await fetch('/api/save-materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ materials: newMaterials })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Error saving new materials:', errorData)
          alert('Some new materials could not be saved')
        }
      }
      
      // Update existing materials via API
      for (const material of existingMaterials) {
        const response = await fetch('/api/update-material', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(material)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Error updating material:', errorData)
        }
      }

      // Save/update assignments
      for (const assignment of lesson.assignments) {
        if (assignment.id.startsWith('assignment-')) {
          // New assignment - insert
          const { error } = await supabase
            .from('assignments')
            .insert({
              course_id: courseId,
              title: assignment.title,
              description: assignment.description,
              due_date: assignment.dueDate
            })
          if (error) console.error('Error saving assignment:', error)
        } else {
          // Existing assignment - update
          const { error } = await supabase
            .from('assignments')
            .update({
              title: assignment.title,
              description: assignment.description,
              due_date: assignment.dueDate
            })
            .eq('id', assignment.id)
          if (error) console.error('Error updating assignment:', error)
        }
      }

      alert('Lesson saved successfully!')
      
      // Reload the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error saving lesson:', error)
      alert('Failed to save lesson. Please try again.')
    }
  }

  const handleAddMaterial = () => {
    if (!lesson) return

    const newMaterial: Material = {
      id: `material-${Date.now()}`,
      name: '',
      type: 'pdf',
      url: '',
      size: ''
    }

    setLesson({
      ...lesson,
      materials: [...lesson.materials, newMaterial]
    })
  }

  const handleUpdateMaterial = (materialId: string, field: string, value: any) => {
    if (!lesson) return

    setLesson({
      ...lesson,
      materials: lesson.materials.map(material =>
        material.id === materialId ? { ...material, [field]: value } : material
      )
    })
  }

  const handleRemoveMaterial = async (materialId: string) => {
    if (!lesson) return

    if (!confirm('Are you sure you want to delete this material?')) {
      return
    }

    // If it's an existing material (not a temp ID), delete from database via API
    if (!materialId.startsWith('material-')) {
      const material = lesson.materials.find(m => m.id === materialId)
      const response = await fetch('/api/delete-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: materialId,
          url: material?.url
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        alert('Error deleting material: ' + (errorData.error || 'Unknown error'))
        return
      }
      
      alert('Material deleted successfully!')
    }

    // Update UI immediately
    setLesson({
      ...lesson,
      materials: lesson.materials.filter(material => material.id !== materialId)
    })
  }

  const handleAddAssignment = () => {
    if (!lesson) return

    const newAssignment: Assignment = {
      id: `assignment-${Date.now()}`,
      title: '',
      description: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      maxPoints: 100,
      instructions: ''
    }

    setLesson({
      ...lesson,
      assignments: [...lesson.assignments, newAssignment]
    })
  }

  const handleUpdateAssignment = (assignmentId: string, field: string, value: any) => {
    if (!lesson) return

    setLesson({
      ...lesson,
      assignments: lesson.assignments.map(assignment =>
        assignment.id === assignmentId ? { ...assignment, [field]: value } : assignment
      )
    })
  }

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!lesson) return

    if (!confirm('Are you sure you want to delete this assignment?')) {
      return
    }

    // If it's an existing assignment (not a temp ID), delete from database
    if (!assignmentId.startsWith('assignment-')) {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId)
      
      if (error) {
        alert('Error deleting assignment: ' + error.message)
        return
      }
      
      alert('Assignment deleted successfully!')
    }

    // Update UI immediately
    setLesson({
      ...lesson,
      assignments: lesson.assignments.filter(assignment => assignment.id !== assignmentId)
    })
  }

  const handleStartGrading = (submissionId: string) => {
    const submission = submissions.find(s => s.id === submissionId)
    if (submission) {
      setGradingSubmission(submissionId)
      setGradeForm({
        grade: submission.grade || 0,
        feedback: submission.feedback || ''
      })
    }
  }

  const handleSaveGrade = async () => {
    if (!gradingSubmission) return

    try {
      // TODO: Update submission grade in Supabase
      // const { error } = await supabase
      //   .from('submissions')
      //   .update({
      //     grade: gradeForm.grade,
      //     feedback: gradeForm.feedback,
      //     status: 'graded'
      //   })
      //   .eq('id', gradingSubmission)

      const updatedSubmissions = submissions.map(submission =>
        submission.id === gradingSubmission
          ? { ...submission, grade: gradeForm.grade, feedback: gradeForm.feedback, status: 'graded' as const }
          : submission
      )
      setSubmissions(updatedSubmissions)

      setGradingSubmission(null)
      setGradeForm({ grade: 0, feedback: '' })
      alert('Grade saved successfully!')
    } catch (error) {
      console.error('Error updating submission grade:', error)
      alert('Failed to save grade. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Not Found</h2>
          <Link href={`/admin/courses/${courseId}`} className="text-blue-600 hover:text-blue-500">
            ← Back to Course
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href={`/admin/courses/${courseId}`}
                className="text-gray-500 hover:text-gray-700 mr-4 flex items-center"
              >
                
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Course
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{lesson.title}</h1>
                <p className="text-sm text-gray-500">Content Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                lesson.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {lesson.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'content', label: 'Content', count: null },
              { key: 'materials', label: 'Materials', count: lesson.materials.length },
              { key: 'assignments', label: 'Assignments', count: lesson.assignments.length },
              { key: 'submissions', label: 'Submissions', count: submissions.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} {tab.count !== null && `(${tab.count})`}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Title</label>
                <input
                  type="text"
                  value={lesson.title}
                  onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={lesson.description}
                  onChange={(e) => setLesson({ ...lesson, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={lesson.content}
                  onChange={(e) => setLesson({ ...lesson, content: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the lesson content, learning objectives, and instructions..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={lesson.duration}
                    onChange={(e) => setLesson({ ...lesson, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={lesson.isPublished ? 'published' : 'draft'}
                    onChange={(e) => setLesson({ ...lesson, isPublished: e.target.value === 'published' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Learning Materials</h3>
              <button
                onClick={handleAddMaterial}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
              >
                
                <Plus className="w-4 h-4" />
                <span>Add Material</span>
              </button>
            </div>

            {lesson.materials.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No materials yet</h3>
                <p className="text-gray-600 mb-4">Add learning materials to help students understand the lesson.</p>
                <button
                  onClick={handleAddMaterial}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Add First Material
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {lesson.materials.map((material) => (
                  <div key={material.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Material Name</label>
                        <input
                          type="text"
                          value={material.name}
                          onChange={(e) => handleUpdateMaterial(material.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter material name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                          value={material.type}
                          onChange={(e) => handleUpdateMaterial(material.id, 'type', e.target.value)}
                          disabled={!!(material.url && !material.id.startsWith('material-'))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="pdf">PDF Document</option>
                          <option value="video">Video</option>
                          <option value="document">Document</option>
                          <option value="image">Image</option>
                          <option value="link">External Link</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => handleRemoveMaterial(material.id)}
                          className="w-full bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center space-x-2"
                        >
                          
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {material.type === 'link' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="url"
                            value={material.url}
                            onChange={(e) => handleUpdateMaterial(material.id, 'url', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com"
                          />
                          {material.url && (
                            <a
                              href={material.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {material.url ? 'Current File' : 'File Upload'}
                        </label>
                        {material.url && (
                          <div className="bg-gray-50 p-4 rounded-lg border mb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <FileText className="w-8 h-8 text-blue-600" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {material.fileName || material.name}
                                  </p>
                                  {material.size && (
                                    <p className="text-xs text-gray-500">{material.size}</p>
                                  )}
                                </div>
                              </div>
                              <a
                                href={material.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md flex items-center space-x-1"
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span>View</span>
                              </a>
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {material.url ? 'Replace File' : 'Upload File'}
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <input
                              type="file"
                              id={`file-${material.id}`}
                              accept={
                                material.type === 'pdf' ? '.pdf' :
                                material.type === 'video' ? '.mp4,.avi,.mov,.wmv' :
                                material.type === 'image' ? '.jpg,.jpeg,.png,.gif,.webp,.svg' :
                                '.doc,.docx,.txt,.rtf'
                              }
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  // Auto-detect type from file extension
                                  const ext = file.name.split('.').pop()?.toLowerCase()
                                  let detectedType: 'pdf' | 'video' | 'document' | 'image' | 'link' = material.type
                                  
                                  if (ext === 'pdf') detectedType = 'pdf'
                                  else if (['mp4', 'avi', 'mov', 'wmv'].includes(ext || '')) detectedType = 'video'
                                  else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')) detectedType = 'image'
                                  else if (['doc', 'docx', 'txt', 'rtf'].includes(ext || '')) detectedType = 'document'
                                  
                                  // Create blob URL for preview
                                  const blobUrl = URL.createObjectURL(file)
                                  
                                  // Update all material properties at once to ensure File object is preserved
                                  setLesson(prevLesson => {
                                    if (!prevLesson) return prevLesson
                                    return {
                                      ...prevLesson,
                                      materials: prevLesson.materials.map(m =>
                                        m.id === material.id
                                          ? {
                                              ...m,
                                              type: detectedType,
                                              file: file, // Store File object
                                              fileName: file.name,
                                              size: `${(file.size / 1024).toFixed(2)} KB`,
                                              url: blobUrl // Temporary preview URL
                                            }
                                          : m
                                      )
                                    }
                                  })
                                  
                                  console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type)
                                }
                              }}
                              className="hidden"
                            />
                            <label htmlFor={`file-${material.id}`} className="cursor-pointer block">
                              <div className="text-center">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {material.type === 'pdf' && 'PDF files only'}
                                  {material.type === 'video' && 'MP4, AVI, MOV files'}
                                  {material.type === 'image' && 'JPG, PNG, GIF, WebP, SVG files'}
                                  {material.type === 'document' && 'DOC, DOCX, TXT files'}
                                </p>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
              <button
                onClick={handleAddAssignment}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
              >
                
                <Plus className="w-4 h-4" />
                <span>Add Assignment</span>
              </button>
            </div>

            {lesson.assignments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
                <p className="text-gray-600 mb-4">Create assignments to assess student learning.</p>
                <button
                  onClick={handleAddAssignment}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Create First Assignment
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {lesson.assignments.map((assignment) => (
                  <div key={assignment.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
                        <input
                          type="text"
                          value={assignment.title}
                          onChange={(e) => handleUpdateAssignment(assignment.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter assignment title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                        <input
                          type="date"
                          value={assignment.dueDate}
                          onChange={(e) => handleUpdateAssignment(assignment.id, 'dueDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={assignment.description}
                        onChange={(e) => handleUpdateAssignment(assignment.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter assignment description"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                      <textarea
                        value={assignment.instructions}
                        onChange={(e) => handleUpdateAssignment(assignment.id, 'instructions', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter detailed instructions for students"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Points</label>
                        <input
                          type="number"
                          value={assignment.maxPoints}
                          onChange={(e) => handleUpdateAssignment(assignment.id, 'maxPoints', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={assignment.status}
                          onChange={(e) => handleUpdateAssignment(assignment.id, 'status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => handleRemoveAssignment(assignment.id)}
                          className="w-full bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center space-x-2"
                        >
                          
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        assignment.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assignment.status.toUpperCase()}
                      </span>
                      <button
                        onClick={() => router.push(`/admin/courses/${courseId}/assignments/${assignment.id}/submissions`)}
                        className="text-blue-600 hover:text-blue-500 text-sm font-medium flex items-center space-x-1"
                      >
                        
                        <Eye className="w-4 h-4" />
                        <span>View Submissions</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Student Submissions</h3>

            {submissions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                <p className="text-gray-600">Student submissions will appear here once they start submitting assignments.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{submission.studentName}</h4>
                        <p className="text-sm text-gray-600">
                          Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                        submission.status === 'returned' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {submission.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Submission Content:</h5>
                      <div className="bg-gray-50 p-3 rounded border">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{submission.content}</p>
                        {submission.fileName && (
                          <div className="mt-2 flex items-center text-sm text-blue-600">
                            
                            <FileText className="w-4 h-4 mr-1" />
                            <span>Attached: {submission.fileName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {submission.status === 'graded' && (
                      <div className="mb-4 bg-green-50 p-3 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-800">Grade: {submission.grade}%</span>
                        </div>
                        {submission.feedback && (
                          <div>
                            <p className="text-sm font-medium text-green-800 mb-1">Feedback:</p>
                            <p className="text-sm text-green-700">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-3">
                      {submission.status !== 'graded' && (
                        <button
                          onClick={() => handleStartGrading(submission.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Grade Submission
                        </button>
                      )}
                      {submission.status === 'graded' && (
                        <button
                          onClick={() => handleStartGrading(submission.id)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Update Grade
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save Button at Bottom */}
        <div className="mt-8 flex justify-end space-x-3 pb-8">
          <button
            onClick={() => router.push(`/admin/courses/${courseId}`)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveLesson}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Grade Submission
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeForm.grade}
                  onChange={(e) => setGradeForm({ ...gradeForm, grade: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback
                </label>
                <textarea
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide feedback to the student..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveGrade}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Save Grade
              </button>
              <button
                onClick={() => {
                  setGradingSubmission(null)
                  setGradeForm({ grade: 0, feedback: '' })
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium"
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