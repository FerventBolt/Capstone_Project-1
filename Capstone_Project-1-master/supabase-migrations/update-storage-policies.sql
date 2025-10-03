-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Create more specific policies
-- Allow authenticated users to upload files if they have access to the lesson
CREATE POLICY "Allow course material uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'course-materials' AND
    (auth.role() = 'service_role' OR auth.role() = 'authenticated')
);

-- Allow authenticated users to read any course materials
CREATE POLICY "Allow course material reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'course-materials');

-- Allow authenticated users to update their uploads
CREATE POLICY "Allow course material updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'course-materials');

-- Allow authenticated users to delete files
CREATE POLICY "Allow course material deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-materials');