-- =====================================================
-- UPDATE PORTFOLIO CATEGORIES (BULLDOZER VERSION)
-- Use this if you are getting "violated by some row" errors
-- =====================================================

-- 1. Drop any existing constraint first
ALTER TABLE portfolio DROP CONSTRAINT IF EXISTS portfolio_category_check;

-- 2. Force all existing data to match one of the 5 new categories
-- This uses a CASE statement to rename everything correctly
UPDATE portfolio 
SET category = CASE 
    WHEN category = 'studio' THEN 'Personal portrait session'
    WHEN category = 'business' OR category = 'corporate' THEN 'Business headshot'
    WHEN category = 'outdoor' OR category = 'creative' THEN 'artistic'
    WHEN category = 'events' THEN 'Event Coverage'
    -- If it's already one of the new ones, keep it
    WHEN category IN ('Personal portrait session', 'Business headshot', 'artistic', 'Event Coverage', 'video') THEN category
    -- If it's something else entirely, default it to 'artistic'
    ELSE 'artistic'
END;

-- 3. Now that all data is clean, add the constraint
ALTER TABLE portfolio ADD CONSTRAINT portfolio_category_check 
CHECK (category IN ('Personal portrait session', 'Business headshot', 'artistic', 'Event Coverage', 'video'));

-- 4. Check the results
SELECT DISTINCT category FROM portfolio;
