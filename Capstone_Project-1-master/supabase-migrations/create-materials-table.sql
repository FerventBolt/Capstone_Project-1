-- Create materials table to store lesson materials
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
  CONSTRAINT materials_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS materials_lesson_id_idx ON public.materials(lesson_id);

-- Enable Row Level Security
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Create policies for materials
CREATE POLICY "Enable read access for all users" ON public.materials
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.materials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.materials
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.materials
  FOR DELETE USING (auth.role() = 'authenticated');