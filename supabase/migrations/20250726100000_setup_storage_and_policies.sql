/*
# [Setup Storage and Policies]
This migration sets up the necessary storage bucket for exam images and configures Row Level Security (RLS) policies for the 'analyses' and 'profiles' tables, ensuring users can only access their own data.

## Query Description:
- **Storage Bucket:** Creates a new storage bucket named 'exam_images' to store uploaded medical images. This bucket is initially private.
- **RLS Policies:**
  - Enables RLS on `analyses` and `profiles` tables.
  - `profiles`: Allows users to view their own profile and allows the application to create a new profile when a new user signs up.
  - `analyses`: Allows users to perform all CRUD operations (create, read, update, delete) only on their own analysis records.
  - `storage.objects`: Allows authenticated users to upload, view, update, and delete images within their own user-specific folder inside the 'exam_images' bucket. This is crucial for data privacy.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true (Policies and bucket can be dropped)

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes, this migration is the foundation of the application's data security model.
- Auth Requirements: Policies are based on `auth.uid()`, linking data directly to the authenticated user.
*/

-- 1. Create Storage bucket for exam images
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam_images', 'exam_images', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can perform all operations on their own analyses." ON public.analyses;
DROP POLICY IF EXISTS "Authenticated users can upload images." ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images." ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images." ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images." ON storage.objects;

-- 4. Create RLS policies for profiles
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 5. Create RLS policies for analyses
CREATE POLICY "Users can perform all operations on their own analyses."
ON public.analyses FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Create RLS policies for storage
CREATE POLICY "Authenticated users can upload images."
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'exam_images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own images."
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'exam_images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own images."
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'exam_images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own images."
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'exam_images' AND (storage.foldername(name))[1] = auth.uid()::text);
