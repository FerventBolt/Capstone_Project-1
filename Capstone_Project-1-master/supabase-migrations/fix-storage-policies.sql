-- Fix storage policies for course-materials bucket
-- This resolves the RLS policy violation error

-- First, drop all existing policies on storage.objects for this bucket
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow course material uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow course material reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow course material updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow course material deletes" ON storage.objects;

-- Create new permissive policies for course-materials bucket

-- Allow authenticated users to INSERT (upload) files
CREATE POLICY "Authenticated users can upload course materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-materials');

-- Allow authenticated users to SELECT (read) files
CREATE POLICY "Authenticated users can read course materials"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'course-materials');

-- Allow public SELECT for course materials (so students can view them)
CREATE POLICY "Public can read course materials"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-materials');

-- Allow authenticated users to UPDATE files
CREATE POLICY "Authenticated users can update course materials"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'course-materials')
WITH CHECK (bucket_id = 'course-materials');

-- Allow authenticated users to DELETE files
CREATE POLICY "Authenticated users can delete course materials"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-materials');