'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, Upload } from 'lucide-react'

interface Material {
  id: string
  name: string
  type: 'pdf' | 'video' | 'document' | 'link'
  url: string
  size?: string
  fileName?: string
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

export default function NewContentPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string

  const [lesson, setLesson] = useState({
    title: '',
    description: '',
    content: '',
    duration: 45,
    materials: [] as Material[],
    assignments: [] as Assignment[],
    isPublished: false
  })

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!lesson.title.trim()) {
      alert('Please enter a lesson title')
      return
    }

    setSaving(true)
    try {
      const lessonId = `lesson-${Date.now()}`
      const newLesson = {
        id: lessonId,
        ...lesson,
        order: 1, // Will be updated based on existing lessons
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Get existing lessons
      const storedLessons = localStorage.getItem(`course-${courseId}-lessons`)
      const existingLessons = storedLessons ? JSON.parse(storedLessons) : []
      
      // Add new lesson
      const updatedLessons = [...existingLessons, { ...newLesson, order: existingLessons.length + 1 }]
      localStorage.setItem(`course-${courseId}-lessons`, JSON.stringify(updatedLessons))

      alert('Lesson created successfully!')
      router.push(`/staff/courses/${courseId}/content/${lessonId}`)
    } catch (error) {
      console.error('Error creating lesson:', error)
      alert('Failed to create lesson. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const addMaterial = () => {
    const newMaterial: Material = {
      id: `material-${Date.now()}`,
      name: '',
      type: 'pdf',
      url: '',
      size: ''
    }
    setLesson(prev => ({
      ...prev,
      materials: [...prev.materials, newMaterial]
    }))
  }

  const updateMaterial = (materialId: string, field: string, value: any) => {
    setLesson(prev => ({
      ...prev,
      materials: prev.materials.map(material =>
        material.id === materialId ? { ...material, [field]: value } : material
      )
    }))
  }

  const removeMaterial = (materialId: string) => {
    setLesson(prev => ({
      ...prev,
      materials: prev.materials.filter(material => material.id !== materialId)
    }))
  }

  const addAssignment = () => {
    const newAssignment: Assignment = {
      id: `assignment-${Date.now()}`,
      title: '',
      description: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      maxPoints: 100,
      instructions: ''
    }
    setLesson(prev => ({
      ...prev,
      assignments: [...prev.assignments, newAssignment]
    }))
  }

  const updateAssignment = (assignmentId: string, field: string, value: any) => {
    setLesson(prev => ({
      ...prev,
      assignments: prev.assignments.map(assignment =>
        assignment.id === assignmentId ? { ...assignment, [field]: value } : assignment
      )
    }))
  }

  const removeAssignment = (assignmentId: string) => {
    setLesson(prev => ({
      ...prev,
      assignments: prev.assignments.filter(assignment => assignment.id !== assignmentId)
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href={`/staff/courses/${courseId}`}
                className="text-gray-500 hover:text-gray-700 mr-4 flex items-center"
              >
                {/*  - Lucide icon type issue with strict TypeScript */}
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Course
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Create New Lesson</h1>
                <p className="text-sm text-gray-500">Add content, materials, and assignments</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
              >
                {/*  - Lucide icon type issue with strict TypeScript */}
                <Save className="w-4 h-4" />
                <span>{saving ? 'Creating...' : 'Create Lesson'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Title *</label>
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => setLesson(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter lesson title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={lesson.description}
                onChange={(e) => setLesson(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter lesson description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={lesson.content}
                onChange={(e) => setLesson(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
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
                  onChange={(e) => setLesson(prev => ({ ...prev, duration: parseInt(e.target.value) || 45 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={lesson.isPublished ? 'published' : 'draft'}
                  onChange={(e) => setLesson(prev => ({ ...prev, isPublished: e.target.value === 'published' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {/* Materials Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Learning Materials</h3>
                <button
                  onClick={addMaterial}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                >
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <Plus className="w-4 h-4" />
                  <span>Add Material</span>
                </button>
              </div>

              <div className="space-y-4">
                {lesson.materials.map((material) => (
                  <div key={material.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Material Name</label>
                        <input
                          type="text"
                          value={material.name}
                          onChange={(e) => updateMaterial(material.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter material name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                          value={material.type}
                          onChange={(e) => updateMaterial(material.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pdf">PDF Document</option>
                          <option value="video">Video</option>
                          <option value="document">Document</option>
                          <option value="link">External Link</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeMaterial(material.id)}
                          className="w-full bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center space-x-2"
                        >
                          {/*  - Lucide icon type issue with strict TypeScript */}
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {material.type === 'link' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                        <input
                          type="url"
                          value={material.url}
                          onChange={(e) => updateMaterial(material.id, 'url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">File Upload</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <div className="text-center">
                            {/*  - Lucide icon type issue with strict TypeScript */}
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {material.type === 'pdf' && 'PDF files only'}
                              {material.type === 'video' && 'MP4, AVI, MOV files'}
                              {material.type === 'document' && 'DOC, DOCX, TXT files'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {lesson.materials.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No materials added yet. Click "Add Material" to add learning resources.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Assignments Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
                <button
                  onClick={addAssignment}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                >
                  {/*  - Lucide icon type issue with strict TypeScript */}
                  <Plus className="w-4 h-4" />
                  <span>Add Assignment</span>
                </button>
              </div>

              <div className="space-y-6">
                {lesson.assignments.map((assignment) => (
                  <div key={assignment.id} className="bg-gray-50 rounded-lg p-6 border">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
                        <input
                          type="text"
                          value={assignment.title}
                          onChange={(e) => updateAssignment(assignment.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter assignment title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                        <input
                          type="date"
                          value={assignment.dueDate}
                          onChange={(e) => updateAssignment(assignment.id, 'dueDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={assignment.description}
                        onChange={(e) => updateAssignment(assignment.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter assignment description"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                      <textarea
                        value={assignment.instructions}
                        onChange={(e) => updateAssignment(assignment.id, 'instructions', e.target.value)}
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
                          onChange={(e) => updateAssignment(assignment.id, 'maxPoints', parseInt(e.target.value) || 100)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={assignment.status}
                          onChange={(e) => updateAssignment(assignment.id, 'status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeAssignment(assignment.id)}
                          className="w-full bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center space-x-2"
                        >
                          {/*  - Lucide icon type issue with strict TypeScript */}
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {lesson.assignments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No assignments added yet. Click "Add Assignment" to create assessments.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}