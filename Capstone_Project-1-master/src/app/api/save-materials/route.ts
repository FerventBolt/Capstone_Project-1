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
    const { materials } = body

    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      return NextResponse.json(
        { error: 'No materials provided' },
        { status: 400 }
      )
    }

    // Insert materials using service role client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('materials')
      .insert(materials)
      .select()

    if (error) {
      console.error('Error saving materials:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      materials: data
    })
  } catch (error) {
    console.error('Save materials exception:', error)
    return NextResponse.json(
      { error: 'Failed to save materials' },
      { status: 500 }
    )
  }
}