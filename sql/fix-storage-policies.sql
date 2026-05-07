<<<<<<< HEAD
-- =====================================================
-- FIX STORAGE POLICIES FOR PORTFOLIO UPLOADS
-- Run this in Supabase SQL Editor to fix upload issues
-- =====================================================

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view portfolio items" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload portfolio items" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update portfolio items" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio items" ON storage.objects;

DROP POLICY IF EXISTS "Public can view videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete videos" ON storage.objects;

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- =====================================================
-- PORTFOLIO BUCKET POLICIES
-- =====================================================

-- Allow everyone to view portfolio items
CREATE POLICY "Public can view portfolio items"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio');

-- Allow authenticated users to upload portfolio items
CREATE POLICY "Authenticated users can upload portfolio items"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio');

-- Allow authenticated users to update portfolio items
CREATE POLICY "Authenticated users can update portfolio items"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio')
WITH CHECK (bucket_id = 'portfolio');

-- Allow authenticated users to delete portfolio items
CREATE POLICY "Authenticated users can delete portfolio items"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio');

-- =====================================================
-- VIDEOS BUCKET POLICIES
-- =====================================================

-- Allow everyone to view videos
CREATE POLICY "Public can view videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

-- Allow authenticated users to update videos
CREATE POLICY "Authenticated users can update videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'videos')
WITH CHECK (bucket_id = 'videos');

-- Allow authenticated users to delete videos
CREATE POLICY "Authenticated users can delete videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'videos');

-- =====================================================
-- AVATARS BUCKET POLICIES
-- =====================================================

-- Allow everyone to view avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- VERIFY BUCKETS EXIST
-- =====================================================

-- Check if buckets exist, create if they don't
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;
=======
-- =====================================================
-- FIX STORAGE POLICIES FOR PORTFOLIO UPLOADS
-- Run this in Supabase SQL Editor to fix upload issues
-- =====================================================

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view portfolio items" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload portfolio items" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update portfolio items" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio items" ON storage.objects;

DROP POLICY IF EXISTS "Public can view videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete videos" ON storage.objects;

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- =====================================================
-- PORTFOLIO BUCKET POLICIES
-- =====================================================

-- Allow everyone to view portfolio items
CREATE POLICY "Public can view portfolio items"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio');

-- Allow authenticated users to upload portfolio items
CREATE POLICY "Authenticated users can upload portfolio items"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio');

-- Allow authenticated users to update portfolio items
CREATE POLICY "Authenticated users can update portfolio items"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio')
WITH CHECK (bucket_id = 'portfolio');

-- Allow authenticated users to delete portfolio items
CREATE POLICY "Authenticated users can delete portfolio items"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio');

-- =====================================================
-- VIDEOS BUCKET POLICIES
-- =====================================================

-- Allow everyone to view videos
CREATE POLICY "Public can view videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

-- Allow authenticated users to update videos
CREATE POLICY "Authenticated users can update videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'videos')
WITH CHECK (bucket_id = 'videos');

-- Allow authenticated users to delete videos
CREATE POLICY "Authenticated users can delete videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'videos');

-- =====================================================
-- AVATARS BUCKET POLICIES
-- =====================================================

-- Allow everyone to view avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- VERIFY BUCKETS EXIST
-- =====================================================

-- Check if buckets exist, create if they don't
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;
>>>>>>> a0f94cd2f455cd5b65045c161fc96ba4dddb1da9
