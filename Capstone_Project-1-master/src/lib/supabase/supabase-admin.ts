import { createClient } from '@supabase/supabase-js'

// These should only run on the server
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,                 // private URL
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,     // service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
