<<<<<<< HEAD
-- =====================================================
-- HANSYPIX SEED DATA
-- Sample data for testing and demonstration
-- OPTIONAL: Run this file to populate database with sample data
-- =====================================================

-- =====================================================
-- SAMPLE PORTFOLIO ITEMS
-- Note: These use placeholder URLs - replace with actual media
-- =====================================================

INSERT INTO portfolio (title, description, category, media_type, media_url, thumbnail_url, is_featured, display_order, tags) VALUES
-- Studio Photography
('Professional Headshot', 'Corporate headshot with professional lighting', 'studio', 'image', '/public/images/portfolio/studio-1.jpg', '/public/images/portfolio/studio-1-thumb.jpg', true, 1, ARRAY['headshot', 'corporate', 'professional']),
('Fashion Portrait', 'High-fashion studio portrait with dramatic lighting', 'studio', 'image', '/public/images/portfolio/studio-2.jpg', '/public/images/portfolio/studio-2-thumb.jpg', true, 2, ARRAY['fashion', 'portrait', 'dramatic']),
('Product Photography', 'Commercial product photography for e-commerce', 'studio', 'image', '/public/images/portfolio/studio-3.jpg', '/public/images/portfolio/studio-3-thumb.jpg', false, 3, ARRAY['product', 'commercial', 'ecommerce']),
('Family Portrait', 'Beautiful family studio session', 'studio', 'image', '/public/images/portfolio/studio-4.jpg', '/public/images/portfolio/studio-4-thumb.jpg', false, 4, ARRAY['family', 'portrait', 'group']),

-- Outdoor Photography
('Sunset Engagement', 'Romantic engagement session at golden hour', 'outdoor', 'image', '/public/images/portfolio/outdoor-1.jpg', '/public/images/portfolio/outdoor-1-thumb.jpg', true, 5, ARRAY['engagement', 'sunset', 'romantic']),
('Nature Portrait', 'Environmental portrait in natural setting', 'outdoor', 'image', '/public/images/portfolio/outdoor-2.jpg', '/public/images/portfolio/outdoor-2-thumb.jpg', true, 6, ARRAY['nature', 'portrait', 'environmental']),
('Urban Lifestyle', 'Urban lifestyle photography session', 'outdoor', 'image', '/public/images/portfolio/outdoor-3.jpg', '/public/images/portfolio/outdoor-3-thumb.jpg', false, 7, ARRAY['urban', 'lifestyle', 'city']),
('Beach Photoshoot', 'Coastal photography session at the beach', 'outdoor', 'image', '/public/images/portfolio/outdoor-4.jpg', '/public/images/portfolio/outdoor-4-thumb.jpg', false, 8, ARRAY['beach', 'coastal', 'summer']),

-- Event Photography
('Wedding Ceremony', 'Beautiful wedding ceremony moments', 'events', 'image', '/public/images/portfolio/event-1.jpg', '/public/images/portfolio/event-1-thumb.jpg', true, 9, ARRAY['wedding', 'ceremony', 'celebration']),
('Corporate Event', 'Professional corporate event coverage', 'events', 'image', '/public/images/portfolio/event-2.jpg', '/public/images/portfolio/event-2-thumb.jpg', false, 10, ARRAY['corporate', 'event', 'business']),
('Birthday Party', 'Joyful birthday celebration photography', 'events', 'image', '/public/images/portfolio/event-3.jpg', '/public/images/portfolio/event-3-thumb.jpg', false, 11, ARRAY['birthday', 'party', 'celebration']),
('Graduation', 'Memorable graduation ceremony photos', 'events', 'image', '/public/images/portfolio/event-4.jpg', '/public/images/portfolio/event-4-thumb.jpg', false, 12, ARRAY['graduation', 'ceremony', 'milestone']),

-- Video Production
('Wedding Highlight Reel', 'Cinematic wedding day highlights', 'video', 'video', '/public/videos/portfolio/wedding-highlight.mp4', '/public/images/portfolio/video-1-thumb.jpg', true, 13, ARRAY['wedding', 'cinematic', 'highlight']),
('Corporate Promo', 'Professional corporate promotional video', 'video', 'video', '/public/videos/portfolio/corporate-promo.mp4', '/public/images/portfolio/video-2-thumb.jpg', true, 14, ARRAY['corporate', 'promo', 'commercial']),
('Event Coverage', 'Full event video coverage', 'video', 'video', '/public/videos/portfolio/event-coverage.mp4', '/public/images/portfolio/video-3-thumb.jpg', false, 15, ARRAY['event', 'coverage', 'documentary']),
('Product Showcase', 'Dynamic product showcase video', 'video', 'video', '/public/videos/portfolio/product-showcase.mp4', '/public/images/portfolio/video-4-thumb.jpg', false, 16, ARRAY['product', 'showcase', 'commercial']);

-- =====================================================
-- SAMPLE CONTACT SUBMISSIONS
-- =====================================================

INSERT INTO contact_submissions (name, email, phone, subject, message, is_read) VALUES
('John Smith', 'john.smith@example.com', '+1 (555) 111-2222', 'Wedding Photography Inquiry', 'Hi, I am interested in booking a wedding photography package for June 2026. Could you provide more details?', false),
('Sarah Johnson', 'sarah.j@example.com', '+1 (555) 333-4444', 'Corporate Headshots', 'We need professional headshots for our team of 15 people. What are your rates?', false),
('Michael Brown', 'mbrown@example.com', '+1 (555) 555-6666', 'Event Coverage', 'Looking for a photographer for our annual company gala. Are you available on March 15th?', true);

-- =====================================================
-- ADDITIONAL SETTINGS
-- =====================================================

INSERT INTO settings (setting_key, setting_value, description) VALUES
('business_hours', '{"monday": "9:00 AM - 6:00 PM", "tuesday": "9:00 AM - 6:00 PM", "wednesday": "9:00 AM - 6:00 PM", "thursday": "9:00 AM - 6:00 PM", "friday": "9:00 AM - 6:00 PM", "saturday": "10:00 AM - 4:00 PM", "sunday": "Closed"}', 'Business operating hours'),
('featured_services', '["Studio Photography", "Outdoor Sessions", "Event Coverage", "Video Production"]', 'Featured services on homepage'),
('testimonials', '[{"name": "Emily Davis", "text": "HANSYPIX captured our wedding beautifully! The photos are absolutely stunning.", "rating": 5}, {"name": "Robert Wilson", "text": "Professional, creative, and a pleasure to work with. Highly recommended!", "rating": 5}, {"name": "Lisa Anderson", "text": "Amazing quality and attention to detail. Our family portraits turned out perfect!", "rating": 5}]', 'Customer testimonials'),
('gallery_layout', '"masonry"', 'Portfolio gallery layout style'),
('enable_bookings', 'true', 'Enable/disable online booking system'),
('enable_chat', 'true', 'Enable/disable chat system')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE portfolio IS 'Sample portfolio items - replace URLs with actual media files';
COMMENT ON TABLE contact_submissions IS 'Sample contact form submissions for testing';
=======
-- =====================================================
-- HANSYPIX SEED DATA
-- Sample data for testing and demonstration
-- OPTIONAL: Run this file to populate database with sample data
-- =====================================================

-- =====================================================
-- SAMPLE PORTFOLIO ITEMS
-- Note: These use placeholder URLs - replace with actual media
-- =====================================================

INSERT INTO portfolio (title, description, category, media_type, media_url, thumbnail_url, is_featured, display_order, tags) VALUES
-- Studio Photography
('Professional Headshot', 'Corporate headshot with professional lighting', 'studio', 'image', '/public/images/portfolio/studio-1.jpg', '/public/images/portfolio/studio-1-thumb.jpg', true, 1, ARRAY['headshot', 'corporate', 'professional']),
('Fashion Portrait', 'High-fashion studio portrait with dramatic lighting', 'studio', 'image', '/public/images/portfolio/studio-2.jpg', '/public/images/portfolio/studio-2-thumb.jpg', true, 2, ARRAY['fashion', 'portrait', 'dramatic']),
('Product Photography', 'Commercial product photography for e-commerce', 'studio', 'image', '/public/images/portfolio/studio-3.jpg', '/public/images/portfolio/studio-3-thumb.jpg', false, 3, ARRAY['product', 'commercial', 'ecommerce']),
('Family Portrait', 'Beautiful family studio session', 'studio', 'image', '/public/images/portfolio/studio-4.jpg', '/public/images/portfolio/studio-4-thumb.jpg', false, 4, ARRAY['family', 'portrait', 'group']),

-- Outdoor Photography
('Sunset Engagement', 'Romantic engagement session at golden hour', 'outdoor', 'image', '/public/images/portfolio/outdoor-1.jpg', '/public/images/portfolio/outdoor-1-thumb.jpg', true, 5, ARRAY['engagement', 'sunset', 'romantic']),
('Nature Portrait', 'Environmental portrait in natural setting', 'outdoor', 'image', '/public/images/portfolio/outdoor-2.jpg', '/public/images/portfolio/outdoor-2-thumb.jpg', true, 6, ARRAY['nature', 'portrait', 'environmental']),
('Urban Lifestyle', 'Urban lifestyle photography session', 'outdoor', 'image', '/public/images/portfolio/outdoor-3.jpg', '/public/images/portfolio/outdoor-3-thumb.jpg', false, 7, ARRAY['urban', 'lifestyle', 'city']),
('Beach Photoshoot', 'Coastal photography session at the beach', 'outdoor', 'image', '/public/images/portfolio/outdoor-4.jpg', '/public/images/portfolio/outdoor-4-thumb.jpg', false, 8, ARRAY['beach', 'coastal', 'summer']),

-- Event Photography
('Wedding Ceremony', 'Beautiful wedding ceremony moments', 'events', 'image', '/public/images/portfolio/event-1.jpg', '/public/images/portfolio/event-1-thumb.jpg', true, 9, ARRAY['wedding', 'ceremony', 'celebration']),
('Corporate Event', 'Professional corporate event coverage', 'events', 'image', '/public/images/portfolio/event-2.jpg', '/public/images/portfolio/event-2-thumb.jpg', false, 10, ARRAY['corporate', 'event', 'business']),
('Birthday Party', 'Joyful birthday celebration photography', 'events', 'image', '/public/images/portfolio/event-3.jpg', '/public/images/portfolio/event-3-thumb.jpg', false, 11, ARRAY['birthday', 'party', 'celebration']),
('Graduation', 'Memorable graduation ceremony photos', 'events', 'image', '/public/images/portfolio/event-4.jpg', '/public/images/portfolio/event-4-thumb.jpg', false, 12, ARRAY['graduation', 'ceremony', 'milestone']),

-- Video Production
('Wedding Highlight Reel', 'Cinematic wedding day highlights', 'video', 'video', '/public/videos/portfolio/wedding-highlight.mp4', '/public/images/portfolio/video-1-thumb.jpg', true, 13, ARRAY['wedding', 'cinematic', 'highlight']),
('Corporate Promo', 'Professional corporate promotional video', 'video', 'video', '/public/videos/portfolio/corporate-promo.mp4', '/public/images/portfolio/video-2-thumb.jpg', true, 14, ARRAY['corporate', 'promo', 'commercial']),
('Event Coverage', 'Full event video coverage', 'video', 'video', '/public/videos/portfolio/event-coverage.mp4', '/public/images/portfolio/video-3-thumb.jpg', false, 15, ARRAY['event', 'coverage', 'documentary']),
('Product Showcase', 'Dynamic product showcase video', 'video', 'video', '/public/videos/portfolio/product-showcase.mp4', '/public/images/portfolio/video-4-thumb.jpg', false, 16, ARRAY['product', 'showcase', 'commercial']);

-- =====================================================
-- SAMPLE CONTACT SUBMISSIONS
-- =====================================================

INSERT INTO contact_submissions (name, email, phone, subject, message, is_read) VALUES
('John Smith', 'john.smith@example.com', '+1 (555) 111-2222', 'Wedding Photography Inquiry', 'Hi, I am interested in booking a wedding photography package for June 2026. Could you provide more details?', false),
('Sarah Johnson', 'sarah.j@example.com', '+1 (555) 333-4444', 'Corporate Headshots', 'We need professional headshots for our team of 15 people. What are your rates?', false),
('Michael Brown', 'mbrown@example.com', '+1 (555) 555-6666', 'Event Coverage', 'Looking for a photographer for our annual company gala. Are you available on March 15th?', true);

-- =====================================================
-- ADDITIONAL SETTINGS
-- =====================================================

INSERT INTO settings (setting_key, setting_value, description) VALUES
('business_hours', '{"monday": "9:00 AM - 6:00 PM", "tuesday": "9:00 AM - 6:00 PM", "wednesday": "9:00 AM - 6:00 PM", "thursday": "9:00 AM - 6:00 PM", "friday": "9:00 AM - 6:00 PM", "saturday": "10:00 AM - 4:00 PM", "sunday": "Closed"}', 'Business operating hours'),
('featured_services', '["Studio Photography", "Outdoor Sessions", "Event Coverage", "Video Production"]', 'Featured services on homepage'),
('testimonials', '[{"name": "Emily Davis", "text": "HANSYPIX captured our wedding beautifully! The photos are absolutely stunning.", "rating": 5}, {"name": "Robert Wilson", "text": "Professional, creative, and a pleasure to work with. Highly recommended!", "rating": 5}, {"name": "Lisa Anderson", "text": "Amazing quality and attention to detail. Our family portraits turned out perfect!", "rating": 5}]', 'Customer testimonials'),
('gallery_layout', '"masonry"', 'Portfolio gallery layout style'),
('enable_bookings', 'true', 'Enable/disable online booking system'),
('enable_chat', 'true', 'Enable/disable chat system')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE portfolio IS 'Sample portfolio items - replace URLs with actual media files';
COMMENT ON TABLE contact_submissions IS 'Sample contact form submissions for testing';
>>>>>>> a0f94cd2f455cd5b65045c161fc96ba4dddb1da9
