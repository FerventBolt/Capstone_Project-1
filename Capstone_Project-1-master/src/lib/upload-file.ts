import { supabase } from './supabase/supabase-client'

export async function uploadMaterialFile(file: File, lessonId: string): Promise<{ url: string; error: string | null }> {
  try {
    // Use API route to upload file (bypasses RLS issues)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('lessonId', lessonId)

    const response = await fetch('/api/upload-material', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Upload error:', errorData)
      return { url: '', error: errorData.error || 'Failed to upload file' }
    }

    const data = await response.json()
    return { url: data.url, error: null }
  } catch (error) {
    console.error('Upload exception:', error)
    return { url: '', error: 'Failed to upload file' }
  }
}

export async function deleteMaterialFile(url: string): Promise<{ error: string | null }> {
  try {
    // Extract file path from URL
    const urlParts = url.split('/course-materials/')
    if (urlParts.length < 2) {
      return { error: 'Invalid file URL' }
    }
    
    const filePath = urlParts[1]
    
    // Delete file from Supabase Storage
    const { error } = await supabase.storage
      .from('course-materials')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error('Delete exception:', error)
    return { error: 'Failed to delete file' }
  }
}