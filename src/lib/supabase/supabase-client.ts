import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://gcvvoixmucjbhxfqfkxl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjdnZvaXhtdWNqYmh4ZnFma3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NzQ4NDIsImV4cCI6MjA3MzI1MDg0Mn0.5pEWmrSpk8Ic3OpPv7gZ67OWLdx1aMNsYkT785CeivE'
)