-- =====================================================
-- UPDATE PORTFOLIO CATEGORIES
-- Run this in Supabase SQL Editor to update allowed categories
-- =====================================================

-- 1. Drop the existing check constraint
ALTER TABLE portfolio DROP CONSTRAINT IF EXISTS portfolio_category_check;

-- 2. Add the new check constraint with updated categories
-- This adds 'business' and 'artistic' while keeping the others
ALTER TABLE portfolio ADD CONSTRAINT portfolio_category_check 
CHECK (category IN ('studio', 'business', 'artistic', 'events', 'video'));

-- 3. (Optional) Migrate existing data if needed
-- For example, if you want to rename 'outdoor' to 'artistic' for all existing items:
UPDATE portfolio SET category = 'artistic' WHERE category = 'outdoor';

-- 4. Verify the change
-- SELECT DISTINCT category FROM portfolio;
