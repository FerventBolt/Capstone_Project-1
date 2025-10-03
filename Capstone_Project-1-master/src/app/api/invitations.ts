import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(
  _req: NextApiRequest,           // leading underscore shows it’s unused
  res: NextApiResponse            // typed response object
) {
  console.log('🔑 SUPABASE_URL:', process.env.SUPABASE_URL?.slice(0, 10))
  console.log('🔒 SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10))

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: invitations, error } = await supabaseAdmin
    .from('invitations')
    .select('*')

  console.log('📨 fetched invitations count:', invitations?.length, 'error:', error)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json(invitations)
}
