import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, url } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Material ID is required' },
        { status: 400 }
      )
    }

    // Delete from storage if URL is provided
    if (url && url.includes('/course-materials/')) {
      const urlParts = url.split('/course-materials/')
      if (urlParts.length >= 2) {
        const filePath = urlParts[1]
        const { error: storageError } = await supabaseAdmin.storage
          .from('course-materials')
          .remove([filePath])
        
        if (storageError) {
          console.error('Error deleting file from storage:', storageError)
        }
      }
    }

    // Delete material from database using service role client (bypasses RLS)
    const { error } = await supabaseAdmin
      .from('materials')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting material:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Delete material exception:', error)
    return NextResponse.json(
      { error: 'Failed to delete material' },
      { status: 500 }
    )
  }
}