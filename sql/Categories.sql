-- =====================================================
-- UPDATE PORTFOLIO CATEGORIES (SAFE VERSION)
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. First, drop the existing constraint so we can modify the data
ALTER TABLE portfolio DROP CONSTRAINT IF EXISTS portfolio_category_check;

-- 2. Update existing data to match the new naming convention
-- This ensures no row violates the new constraint
UPDATE portfolio SET category = 'Personal portrait session' WHERE category = 'studio';
UPDATE portfolio SET category = 'Business headshot' WHERE category = 'business' OR category = 'corporate';
UPDATE portfolio SET category = 'artistic' WHERE category = 'outdoor' OR category = 'creative';
UPDATE portfolio SET category = 'Event Coverage' WHERE category = 'events';
-- 'video' stays 'video' or we can change it too
-- UPDATE portfolio SET category = 'Video Production' WHERE category = 'video';

-- 3. Now add the new check constraint with the long names
ALTER TABLE portfolio ADD CONSTRAINT portfolio_category_check 
CHECK (category IN ('Personal portrait session', 'Business headshot', 'artistic', 'Event Coverage', 'video'));

-- 4. Verify
SELECT DISTINCT category FROM portfolio;
