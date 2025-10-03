import { storageService } from '../storage'

// Mock the Supabase client
jest.mock('../supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({
          data: { path: 'test/path/file.pdf' },
          error: null
        }),
        createSignedUrl: jest.fn().mockResolvedValue({
          data: { signedUrl: 'https://test.com/signed-url' },
          error: null
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://test.com/public-url' }
        }),
        remove: jest.fn().mockResolvedValue({ error: null })
      }))
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'test-file-id',
          name: 'test.pdf',
          size: 1024,
          type: 'application/pdf',
          path: 'test/path/file.pdf',
          category: 'documents',
          uploaded_by: 'test-user-id',
          created_at: new Date().toISOString()
        },
        error: null
      }),
      eq: jest.fn().mockReturnThis(),
      delete: jest.fn().mockResolvedValue({ error: null })
    }))
  }))
}))

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf'
      })

      const result = await storageService.uploadFile(mockFile, {
        category: 'documents',
        userId: 'test-user-id'
      })

      expect(result.success).toBe(true)
      expect(result.file).toBeDefined()
      expect(result.file?.name).toBe('test.pdf')
      expect(result.file?.category).toBe('documents')
    })

    it('should reject files that are too large', async () => {
      const mockFile = new File(['x'.repeat(100 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf'
      })

      const result = await storageService.uploadFile(mockFile, {
        category: 'documents',
        maxSize: 10 * 1024 * 1024 // 10MB limit
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('File size exceeds')
    })

    it('should reject files with invalid types', async () => {
      const mockFile = new File(['test content'], 'test.exe', {
        type: 'application/x-executable'
      })

      const result = await storageService.uploadFile(mockFile, {
        category: 'documents'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('File type')
      expect(result.error).toContain('is not allowed')
    })
  })

  describe('getFile', () => {
    it('should retrieve a file by ID', async () => {
      const file = await storageService.getFile('test-file-id')

      expect(file).toBeDefined()
      expect(file?.id).toBe('test-file-id')
      expect(file?.name).toBe('test.pdf')
    })

    it('should return null for non-existent file', async () => {
      // Mock the database to return null
      const mockSupabase = require('../supabase/client').createClient()
      mockSupabase.from().single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' }
      })

      const file = await storageService.getFile('non-existent-id')

      expect(file).toBeNull()
    })
  })

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const result = await storageService.deleteFile('test-file-id')

      expect(result.success).toBe(true)
    })

    it('should handle deletion errors gracefully', async () => {
      // Mock the database to return an error
      const mockSupabase = require('../supabase/client').createClient()
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: { message: 'File not found' }
      })

      const result = await storageService.deleteFile('non-existent-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('File not found')
    })
  })

  describe('getStorageStats', () => {
    it('should return storage statistics', async () => {
      // Mock the database to return file data
      const mockSupabase = require('../supabase/client').createClient()
      mockSupabase.from().select.mockResolvedValueOnce({
        data: [
          { category: 'documents', size: 1024 },
          { category: 'documents', size: 2048 },
          { category: 'certificates', size: 512 }
        ],
        error: null
      })

      const stats = await storageService.getStorageStats('test-user-id')

      expect(stats.totalFiles).toBe(3)
      expect(stats.totalSize).toBe(3584)
      expect(stats.byCategory.documents.count).toBe(2)
      expect(stats.byCategory.documents.size).toBe(3072)
      expect(stats.byCategory.certificates.count).toBe(1)
      expect(stats.byCategory.certificates.size).toBe(512)
    })
  })
})