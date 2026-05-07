<<<<<<< HEAD
-- =====================================================
-- HANSYPIX STORAGE BUCKETS - STEP 1
-- Create buckets only (run this in SQL Editor)
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
=======
-- =====================================================
-- HANSYPIX STORAGE BUCKETS - STEP 1
-- Create buckets only (run this in SQL Editor)
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
>>>>>>> a0f94cd2f455cd5b65045c161fc96ba4dddb1da9
