/*
          # [Initial Schema Setup]
          This migration sets up the initial database schema for the ALIA platform. It includes tables for user profiles and medical analyses, configures Row Level Security (RLS) to protect user data, creates a storage bucket for exam images, and sets up a trigger to automatically create a user profile upon new user registration in Supabase Auth.

          ## Query Description: This operation is structural and foundational for the application.
          - It creates two new tables: `profiles` and `analyses`.
          - It creates a new storage bucket: `exam_images`.
          - It sets up security policies ensuring users can only access their own data.
          - It creates a function and trigger to link `auth.users` with the `profiles` table.
          - There is no risk of data loss as this is the initial setup.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "High"
          - Requires-Backup: false
          - Reversible: true (by dropping tables, policies, and trigger)

          ## Structure Details:
          - Tables Created: `public.profiles`, `public.analyses`
          - Functions Created: `public.handle_new_user()`
          - Triggers Created: `on_auth_user_created` on `auth.users`
          - Storage Buckets Created: `exam_images`

          ## Security Implications:
          - RLS Status: Enabled for `profiles` and `analyses`.
          - Policy Changes: Yes, new policies are created to enforce data isolation between users.
          - Auth Requirements: Policies are based on `auth.uid()`, linking data to authenticated users.

          ## Performance Impact:
          - Indexes: Primary keys and foreign keys are indexed by default.
          - Triggers: A trigger is added to `auth.users`, which runs once per user creation. The performance impact is negligible.
          - Estimated Impact: Low.
          */

-- 1. PROFILES TABLE
-- Stores public user data and links to Supabase Auth.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  plan TEXT DEFAULT 'free'::text NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_plan_active BOOLEAN DEFAULT false
);

COMMENT ON TABLE public.profiles IS 'Stores user profile information, subscription status, and Stripe details.';

-- 2. ANALYSES TABLE
-- Stores each medical analysis performed by a user.
CREATE TABLE public.analyses (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_age INT NOT NULL,
    patient_symptoms TEXT,
    image_url TEXT NOT NULL,
    analysis_text TEXT,
    recommendations_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.analyses IS 'Stores all medical analyses performed by users.';

-- 3. STORAGE BUCKET
-- Create a bucket for exam images with public access turned off.
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam_images', 'exam_images', false)
ON CONFLICT (id) DO NOTHING;

COMMENT ON BUCKET exam_images IS 'Stores uploaded exam images for analysis.';

-- 4. RLS POLICIES FOR PROFILES
-- Enable RLS and define policies for the profiles table.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 5. RLS POLICIES FOR ANALYSES
-- Enable RLS and define policies for the analyses table.
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own analyses."
ON public.analyses FOR ALL
USING (auth.uid() = user_id);

-- 6. RLS POLICIES FOR STORAGE
-- Define policies for the exam_images bucket.
CREATE POLICY "Users can upload exam images."
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'exam_images' AND auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Users can view their own exam images."
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'exam_images' AND auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Users can update their own exam images."
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'exam_images' AND auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Users can delete their own exam images."
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'exam_images' AND auth.uid() = (storage.foldername(name))[1]::uuid);


-- 7. AUTOMATIC PROFILE CREATION
-- Function and trigger to create a new profile when a user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a user profile upon new user registration.';
