-- =====================================================
-- HANSYPIX ROW LEVEL SECURITY POLICIES
-- Security policies for all database tables
-- =====================================================

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Allow user creation on signup
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- =====================================================
-- PORTFOLIO TABLE POLICIES
-- =====================================================

-- Everyone can view portfolio items
CREATE POLICY "Anyone can view portfolio"
ON portfolio FOR SELECT
USING (true);

-- Authenticated users can insert portfolio items (admin check in app)
CREATE POLICY "Authenticated users can insert portfolio"
ON portfolio FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update portfolio items
CREATE POLICY "Authenticated users can update portfolio"
ON portfolio FOR UPDATE
USING (auth.role() = 'authenticated');

-- Authenticated users can delete portfolio items
CREATE POLICY "Authenticated users can delete portfolio"
ON portfolio FOR DELETE
USING (auth.role() = 'authenticated');

-- =====================================================
-- MESSAGES TABLE POLICIES
-- =====================================================

-- Users can view their own messages
CREATE POLICY "Users can view own messages"
ON messages FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "Users can insert own messages"
ON messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own messages (mark as read)
CREATE POLICY "Users can update own messages"
ON messages FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- BOOKINGS TABLE POLICIES
-- =====================================================

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own bookings
CREATE POLICY "Users can create own bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings"
ON bookings FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own bookings
CREATE POLICY "Users can delete own bookings"
ON bookings FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- PAYMENTS TABLE POLICIES
-- =====================================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
ON payments FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own payments
CREATE POLICY "Users can create own payments"
ON payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own payments
CREATE POLICY "Users can update own payments"
ON payments FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- SETTINGS TABLE POLICIES
-- =====================================================

-- Everyone can view settings
CREATE POLICY "Anyone can view settings"
ON settings FOR SELECT
USING (true);

-- Only authenticated users can update settings (admin check in app)
CREATE POLICY "Authenticated users can update settings"
ON settings FOR UPDATE
USING (auth.role() = 'authenticated');

-- Only authenticated users can insert settings
CREATE POLICY "Authenticated users can insert settings"
ON settings FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- CONTACT_SUBMISSIONS TABLE POLICIES
-- =====================================================

-- Anyone can insert contact submissions
CREATE POLICY "Anyone can submit contact form"
ON contact_submissions FOR INSERT
WITH CHECK (true);

-- Only authenticated users can view submissions (admin check in app)
CREATE POLICY "Authenticated users can view submissions"
ON contact_submissions FOR SELECT
USING (auth.role() = 'authenticated');

-- Only authenticated users can update submissions
CREATE POLICY "Authenticated users can update submissions"
ON contact_submissions FOR UPDATE
USING (auth.role() = 'authenticated');

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime for messages table
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE contact_submissions;

-- =====================================================
-- HELPER FUNCTIONS FOR SECURITY
-- =====================================================

-- Function to check if user is admin (based on role in users table)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.users
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_role, 'customer') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM users
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_role, 'customer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON POLICY "Users can view own profile" ON users IS 'Users can only view their own profile data';
COMMENT ON POLICY "Anyone can view portfolio" ON portfolio IS 'Portfolio is public for all visitors';
COMMENT ON POLICY "Users can view own messages" ON messages IS 'Users can only see their own chat messages';
COMMENT ON POLICY "Users can view own bookings" ON bookings IS 'Users can only see their own bookings';
COMMENT ON POLICY "Anyone can view settings" ON settings IS 'Site settings are public';
COMMENT ON POLICY "Anyone can submit contact form" ON contact_submissions IS 'Contact form is public';
