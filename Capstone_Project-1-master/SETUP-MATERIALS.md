# Materials System Setup Guide

The materials system has been fully implemented in the code, but requires database setup to function.

## Quick Setup (3 Steps)

### Step 1: Create the Materials Table

Go to Supabase Dashboard → **SQL Editor** → **New Query**, then run:

```sql
CREATE TABLE IF NOT EXISTS public.materials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('pdf', 'video', 'document', 'link', 'image')),
  url text NOT NULL,
  size text,
  file_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT materials_pkey PRIMARY KEY (id),
  CONSTRAINT materials_lesson_id_fkey FOREIGN KEY (lesson_id) 
    REFERENCES public.lessons(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS materials_lesson_id_idx ON public.materials(lesson_id);
```

### Step 2: Create Public Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Name: `course-materials`
4. **IMPORTANT**: Set to **Public bucket** (toggle ON)
5. Click **Create Bucket**

### Step 3: Configure Bucket Policies (If Using Private Bucket)

If you prefer a private bucket with RLS, go to Storage → course-materials → Policies, then run:

```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-materials');

CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-materials');

CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'course-materials');

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-materials');
```

## Verify Setup

After completing the steps:
1. Refresh your application
2. Go to any course → Content tab
3. Create or edit a lesson
4. Add a material with file upload
5. Materials should now save and appear!

## Features Available

- ✅ Upload PDF, Video, Document, and Image files
- ✅ Add external links
- ✅ Files stored in Supabase Storage
- ✅ Materials persisted in database
- ✅ Image preview for uploaded images
- ✅ File size tracking
- ✅ Edit and delete materials
- ✅ Materials appear in lesson view

## Troubleshooting

**Error: "Could not find the table 'public.materials'"**
- Run Step 1 (create materials table)

**Error: "new row violates row-level security policy"**
- Make sure bucket is set to **Public** (Step 2)
- OR run the storage policies (Step 3)

**Files don't upload**
- Check bucket name is exactly `course-materials`
- Verify bucket is public or has correct policies
- Check browser console for specific errors

## Alternative: Disable RLS on Storage

If you continue having RLS issues, you can disable RLS on the storage bucket:

1. Go to Storage → course-materials
2. Click on **Policies** tab
3. Click **Disable RLS** (if you want public access)
4. Or ensure the policies from Step 3 are applied correctly