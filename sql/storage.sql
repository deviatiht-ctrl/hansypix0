<<<<<<< HEAD
-- =====================================================
-- HANSYPIX STORAGE BUCKETS CONFIGURATION
-- Setup for Supabase Storage buckets
-- =====================================================

-- =====================================================
-- CREATE STORAGE BUCKETS
-- =====================================================

-- Portfolio bucket (photos and videos for portfolio)
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Videos bucket (hero videos and other video content)
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Avatars bucket (user profile pictures)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES FOR PORTFOLIO BUCKET
-- =====================================================

-- Allow public to view portfolio items
CREATE POLICY "Public can view portfolio items"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

-- Allow authenticated users to upload to portfolio (admin will be checked in app)
CREATE POLICY "Authenticated users can upload portfolio items"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'portfolio' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update portfolio items"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'portfolio' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete portfolio items
CREATE POLICY "Authenticated users can delete portfolio items"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'portfolio' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- STORAGE POLICIES FOR VIDEOS BUCKET
-- =====================================================

-- Allow public to view videos
CREATE POLICY "Public can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'videos' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update videos
CREATE POLICY "Authenticated users can update videos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'videos' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete videos
CREATE POLICY "Authenticated users can delete videos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'videos' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- STORAGE POLICIES FOR AVATARS BUCKET
-- =====================================================

-- Allow public to view avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- HELPER FUNCTIONS FOR STORAGE
-- =====================================================

-- Function to get public URL for a storage object
CREATE OR REPLACE FUNCTION get_public_url(bucket_name TEXT, object_path TEXT)
RETURNS TEXT AS $$
DECLARE
    base_url TEXT;
BEGIN
    SELECT decrypted_secret INTO base_url
    FROM vault.decrypted_secrets
    WHERE name = 'supabase_url'
    LIMIT 1;
    
    IF base_url IS NULL THEN
        base_url := current_setting('app.settings.supabase_url', true);
    END IF;
    
    RETURN base_url || '/storage/v1/object/public/' || bucket_name || '/' || object_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON POLICY "Public can view portfolio items" ON storage.objects IS 'Allow anyone to view portfolio images and videos';
COMMENT ON POLICY "Authenticated users can upload portfolio items" ON storage.objects IS 'Allow authenticated users to upload portfolio content';
COMMENT ON POLICY "Public can view videos" ON storage.objects IS 'Allow anyone to view video content';
COMMENT ON POLICY "Public can view avatars" ON storage.objects IS 'Allow anyone to view user avatars';
COMMENT ON POLICY "Users can upload their own avatar" ON storage.objects IS 'Users can only upload to their own avatar folder';
=======
-- =====================================================
-- HANSYPIX STORAGE BUCKETS CONFIGURATION
-- Setup for Supabase Storage buckets
-- =====================================================

-- =====================================================
-- CREATE STORAGE BUCKETS
-- =====================================================

-- Portfolio bucket (photos and videos for portfolio)
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Videos bucket (hero videos and other video content)
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Avatars bucket (user profile pictures)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES FOR PORTFOLIO BUCKET
-- =====================================================

-- Allow public to view portfolio items
CREATE POLICY "Public can view portfolio items"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

-- Allow authenticated users to upload to portfolio (admin will be checked in app)
CREATE POLICY "Authenticated users can upload portfolio items"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'portfolio' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update portfolio items"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'portfolio' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete portfolio items
CREATE POLICY "Authenticated users can delete portfolio items"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'portfolio' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- STORAGE POLICIES FOR VIDEOS BUCKET
-- =====================================================

-- Allow public to view videos
CREATE POLICY "Public can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'videos' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update videos
CREATE POLICY "Authenticated users can update videos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'videos' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete videos
CREATE POLICY "Authenticated users can delete videos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'videos' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- STORAGE POLICIES FOR AVATARS BUCKET
-- =====================================================

-- Allow public to view avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- HELPER FUNCTIONS FOR STORAGE
-- =====================================================

-- Function to get public URL for a storage object
CREATE OR REPLACE FUNCTION get_public_url(bucket_name TEXT, object_path TEXT)
RETURNS TEXT AS $$
DECLARE
    base_url TEXT;
BEGIN
    SELECT decrypted_secret INTO base_url
    FROM vault.decrypted_secrets
    WHERE name = 'supabase_url'
    LIMIT 1;
    
    IF base_url IS NULL THEN
        base_url := current_setting('app.settings.supabase_url', true);
    END IF;
    
    RETURN base_url || '/storage/v1/object/public/' || bucket_name || '/' || object_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON POLICY "Public can view portfolio items" ON storage.objects IS 'Allow anyone to view portfolio images and videos';
COMMENT ON POLICY "Authenticated users can upload portfolio items" ON storage.objects IS 'Allow authenticated users to upload portfolio content';
COMMENT ON POLICY "Public can view videos" ON storage.objects IS 'Allow anyone to view video content';
COMMENT ON POLICY "Public can view avatars" ON storage.objects IS 'Allow anyone to view user avatars';
COMMENT ON POLICY "Users can upload their own avatar" ON storage.objects IS 'Users can only upload to their own avatar folder';
>>>>>>> a0f94cd2f455cd5b65045c161fc96ba4dddb1da9
