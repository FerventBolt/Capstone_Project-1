import { supabase } from 'C:/CapstoneProject/Capstone_Project-main/src/lib/supabase/supabase-client'

export type FileCategory = 
  | 'profile_pictures'
  | 'course_materials'
  | 'assignments'
  | 'certificates'
  | 'documents'
  | 'exam_files'

export interface FileUploadOptions {
  category: FileCategory
  userId?: string
  courseId?: string
  maxSize?: number // in bytes
  allowedTypes?: string[]
  isPublic?: boolean
}

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  publicUrl?: string
  path: string
  category: FileCategory
  uploadedAt: string
  uploadedBy: string
}

export interface FileUploadResult {
  success: boolean
  file?: UploadedFile
  error?: string
}

class StorageService {
  private supabase = supabase

  // Default file size limits (in bytes)
  private readonly DEFAULT_LIMITS = {
    profile_pictures: 5 * 1024 * 1024, // 5MB
    course_materials: 50 * 1024 * 1024, // 50MB
    assignments: 25 * 1024 * 1024, // 25MB
    certificates: 10 * 1024 * 1024, // 10MB
    documents: 25 * 1024 * 1024, // 25MB
    exam_files: 10 * 1024 * 1024, // 10MB
  }

  // Default allowed file types
  private readonly DEFAULT_TYPES = {
    profile_pictures: ['image/jpeg', 'image/png', 'image/webp'],
    course_materials: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'video/mp4'],
    assignments: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    certificates: ['application/pdf', 'image/jpeg', 'image/png'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    exam_files: ['application/pdf', 'image/jpeg', 'image/png'],
  }

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(file: File, options: FileUploadOptions): Promise<FileUploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file, options)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Get current user
      const { data: userData, error: userError } = await this.supabase.auth.getUser()
      if (userError || !userData?.user) {
        return { success: false, error: 'User not authenticated' }
      }
      const user = userData.user

      // Generate file path
      const filePath = this.generateFilePath(file, options, user.id)
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        return { success: false, error: uploadError.message }
      }

      // Get public URL if needed
      let publicUrl: string | undefined
      if (options.isPublic) {
        const { data: urlData } = this.supabase.storage
          .from('files')
          .getPublicUrl(filePath)
        publicUrl = urlData.publicUrl
      }

      // Get signed URL for private files
      const { data: signedUrlData, error: urlError } = await this.supabase.storage
        .from('files')
        .createSignedUrl(filePath, 3600) // 1 hour expiry

      if (urlError) {
        return { success: false, error: urlError.message }
      }

      // Save file metadata to database
      const fileRecord = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath,
        category: options.category,
        uploaded_by: user.id,
        course_id: options.courseId || null,
        is_public: options.isPublic || false,
        public_url: publicUrl || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: dbData, error: dbError } = await this.supabase
        .from('files')
        .insert([fileRecord])
        .select()
        .single()

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await this.supabase.storage.from('files').remove([filePath])
        return { success: false, error: dbError.message }
      }

      const uploadedFile: UploadedFile = {
        id: dbData.id,
        name: dbData.name,
        size: dbData.size,
        type: dbData.type,
        url: signedUrlData.signedUrl,
        publicUrl: dbData.public_url,
        path: dbData.path,
        category: dbData.category as FileCategory,
        uploadedAt: dbData.created_at,
        uploadedBy: dbData.uploaded_by
      }

      return { success: true, file: uploadedFile }

    } catch (error) {
      console.error('File upload error:', error)
      return { success: false, error: 'Failed to upload file' }
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[], options: FileUploadOptions): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = []
    
    for (const file of files) {
      const result = await this.uploadFile(file, options)
      results.push(result)
    }

    return results
  }

  /**
   * Get file by ID with fresh signed URL
   */
  async getFile(fileId: string): Promise<UploadedFile | null> {
    try {
      const { data, error } = await this.supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single()

      if (error || !data) {
        return null
      }

      // Generate fresh signed URL
      const { data: signedUrlData } = await this.supabase.storage
        .from('files')
        .createSignedUrl(data.path, 3600)

      return {
        id: data.id,
        name: data.name,
        size: data.size,
        type: data.type,
        url: signedUrlData?.signedUrl || '',
        publicUrl: data.public_url,
        path: data.path,
        category: data.category as FileCategory,
        uploadedAt: data.created_at,
        uploadedBy: data.uploaded_by
      }
    } catch (error) {
      console.error('Get file error:', error)
      return null
    }
  }

  /**
   * Get files by category or course
   */
  async getFiles(filters: {
    category?: FileCategory
    courseId?: string
    userId?: string
    limit?: number
  } = {}): Promise<UploadedFile[]> {
    try {
      let query = this.supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      if (filters.courseId) {
        query = query.eq('course_id', filters.courseId)
      }

      if (filters.userId) {
        query = query.eq('uploaded_by', filters.userId)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Get files error:', error)
        return []
      }

      // Generate fresh signed URLs for private files
      const filesWithUrls = await Promise.all(
        data.map(async (file: any) => {
          let url = file.public_url
          
          if (!url) {
            const { data: signedUrlData } = await this.supabase.storage
              .from('files')
              .createSignedUrl(file.path, 3600)
            url = signedUrlData?.signedUrl || ''
          }

          return {
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
            url,
            publicUrl: file.public_url,
            path: file.path,
            category: file.category as FileCategory,
            uploadedAt: file.created_at,
            uploadedBy: file.uploaded_by
          }
        })
      )

      return filesWithUrls
    } catch (error) {
      console.error('Get files error:', error)
      return []
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get file info first
      const { data: fileData, error: fetchError } = await this.supabase
        .from('files')
        .select('path')
        .eq('id', fileId)
        .single()

      if (fetchError || !fileData) {
        return { success: false, error: 'File not found' }
      }

      // Delete from storage
      const { error: storageError } = await this.supabase.storage
        .from('files')
        .remove([fileData.path])

      if (storageError) {
        console.error('Storage deletion error:', storageError)
      }

      // Delete from database
      const { error: dbError } = await this.supabase
        .from('files')
        .delete()
        .eq('id', fileId)

      if (dbError) {
        return { success: false, error: dbError.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Delete file error:', error)
      return { success: false, error: 'Failed to delete file' }
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File, options: FileUploadOptions): { valid: boolean; error?: string } {
    // Check file size
    const maxSize = options.maxSize || this.DEFAULT_LIMITS[options.category]
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` }
    }

    // Check file type
    const allowedTypes = options.allowedTypes || this.DEFAULT_TYPES[options.category]
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `File type ${file.type} is not allowed` }
    }

    return { valid: true }
  }

  /**
   * Generate file path for storage
   */
  private generateFilePath(file: File, options: FileUploadOptions, userId: string): string {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    
    let basePath = `${options.category}/${userId}`
    
    if (options.courseId) {
      basePath += `/${options.courseId}`
    }
    
    return `${basePath}/${timestamp}_${randomId}_${sanitizedName}`
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(userId?: string): Promise<{
    totalFiles: number
    totalSize: number
    byCategory: Record<FileCategory, { count: number; size: number }>
  }> {
    try {
      let query = this.supabase
        .from('files')
        .select('category, size')

      if (userId) {
        query = query.eq('uploaded_by', userId)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      const stats = {
        totalFiles: data.length,
        totalSize: data.reduce((sum: number, file: any) => sum + file.size, 0),
        byCategory: {} as Record<FileCategory, { count: number; size: number }>
      }

      // Initialize categories
      const categories: FileCategory[] = ['profile_pictures', 'course_materials', 'assignments', 'certificates', 'documents', 'exam_files']
      categories.forEach(category => {
        stats.byCategory[category] = { count: 0, size: 0 }
      })

      // Calculate by category
      data.forEach((file: any) => {
        const category = file.category as FileCategory
        if (stats.byCategory[category]) {
          stats.byCategory[category].count++
          stats.byCategory[category].size += file.size
        }
      })

      return stats
    } catch (error) {
      console.error('Get storage stats error:', error)
      return {
        totalFiles: 0,
        totalSize: 0,
        byCategory: {} as Record<FileCategory, { count: number; size: number }>
      }
    }
  }
}

export const storageService = new StorageService()