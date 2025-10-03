export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          role: 'admin' | 'staff' | 'student'
          phone: string | null
          address: string | null
          date_of_birth: string | null
          profile_picture_url: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role: 'admin' | 'staff' | 'student'
          phone?: string | null
          address?: string | null
          date_of_birth?: string | null
          profile_picture_url?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: 'admin' | 'staff' | 'student'
          phone?: string | null
          address?: string | null
          date_of_birth?: string | null
          profile_picture_url?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'staff' | 'student'
          invitation_code: string
          otp: string
          expires_at: string
          is_used: boolean
          invited_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'admin' | 'staff' | 'student'
          invitation_code: string
          otp: string
          expires_at: string
          is_used?: boolean
          invited_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'staff' | 'student'
          invitation_code?: string
          otp?: string
          expires_at?: string
          is_used?: boolean
          invited_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          duration_hours: number
          max_students: number | null
          instructor_id: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          duration_hours: number
          max_students?: number | null
          instructor_id: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          duration_hours?: number
          max_students?: number | null
          instructor_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          course_id: string
          enrollment_date: string
          completion_date: string | null
          status: 'enrolled' | 'in_progress' | 'completed' | 'dropped'
          final_grade: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          enrollment_date: string
          completion_date?: string | null
          status?: 'enrolled' | 'in_progress' | 'completed' | 'dropped'
          final_grade?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          enrollment_date?: string
          completion_date?: string | null
          status?: 'enrolled' | 'in_progress' | 'completed' | 'dropped'
          final_grade?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      certifications: {
        Row: {
          id: string
          name: string
          description: string | null
          category: 'food_beverages' | 'front_office' | 'housekeeping' | 'tourism' | 'cookery'
          duration_hours: number
          prerequisites: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: 'food_beverages' | 'front_office' | 'housekeeping' | 'tourism' | 'cookery'
          duration_hours: number
          prerequisites?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: 'food_beverages' | 'front_office' | 'housekeeping' | 'tourism' | 'cookery'
          duration_hours?: number
          prerequisites?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      certification_applications: {
        Row: {
          id: string
          student_id: string
          certification_id: string
          application_date: string
          status: 'pending' | 'approved' | 'rejected' | 'completed'
          exam_date: string | null
          exam_score: number | null
          certificate_issued_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          certification_id: string
          application_date: string
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          exam_date?: string | null
          exam_score?: number | null
          certificate_issued_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          certification_id?: string
          application_date?: string
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          exam_date?: string | null
          exam_score?: number | null
          certificate_issued_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          priority: 'low' | 'medium' | 'high'
          is_read: boolean
          action_url: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'info' | 'success' | 'warning' | 'error'
          priority?: 'low' | 'medium' | 'high'
          is_read?: boolean
          action_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          priority?: 'low' | 'medium' | 'high'
          is_read?: boolean
          action_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          name: string
          size: number
          type: string
          path: string
          category: 'profile_pictures' | 'course_materials' | 'assignments' | 'certificates' | 'documents' | 'exam_files'
          uploaded_by: string
          course_id: string | null
          is_public: boolean
          public_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          size: number
          type: string
          path: string
          category: 'profile_pictures' | 'course_materials' | 'assignments' | 'certificates' | 'documents' | 'exam_files'
          uploaded_by: string
          course_id?: string | null
          is_public?: boolean
          public_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          size?: number
          type?: string
          path?: string
          category?: 'profile_pictures' | 'course_materials' | 'assignments' | 'certificates' | 'documents' | 'exam_files'
          uploaded_by?: string
          course_id?: string | null
          is_public?: boolean
          public_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      email_logs: {
        Row: {
          id: string
          recipient_email: string
          subject: string
          email_type: string
          status: 'pending' | 'sent' | 'failed'
          sent_at: string | null
          error_message: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recipient_email: string
          subject: string
          email_type: string
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          error_message?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recipient_email?: string
          subject?: string
          email_type?: string
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          error_message?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'staff' | 'student'
      enrollment_status: 'enrolled' | 'in_progress' | 'completed' | 'dropped'
      certification_category: 'food_beverages' | 'front_office' | 'housekeeping' | 'tourism' | 'cookery'
      application_status: 'pending' | 'approved' | 'rejected' | 'completed'
      notification_type: 'info' | 'success' | 'warning' | 'error'
      notification_priority: 'low' | 'medium' | 'high'
      file_category: 'profile_pictures' | 'course_materials' | 'assignments' | 'certificates' | 'documents' | 'exam_files'
      email_status: 'pending' | 'sent' | 'failed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}