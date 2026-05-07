<<<<<<< HEAD
# HANSYPIX - Professional Photography Company Website

## 🎨 Overview
HANSYPIX is a complete, production-ready photography company website featuring modern UI/UX design, real-time chat, admin CMS, and integrated payment systems.

## 🚀 Features
- **Immersive Design**: Glassmorphism, parallax effects, smooth animations
- **Full CMS**: Complete admin panel for content management
- **Real-time Chat**: WhatsApp-style messaging system
- **Payment Integration**: Stripe, PayPal, and MonCash support
- **Responsive**: Mobile-first design with app-like mobile experience
- **Supabase Backend**: Authentication, database, and storage

## 📁 Project Structure
```
/hansypix
├── /public
│   ├── /videos          # Video assets
│   ├── /images          # Image assets
│   └── /icons           # Icon assets
├── /src
│   ├── /pages           # Main website pages
│   ├── /admin           # Admin panel pages
│   ├── /components      # Reusable components
│   ├── /css             # Stylesheets
│   ├── /js              # JavaScript files
│   └── /supabase        # Supabase configuration
├── /sql                 # Database schema files
├── test.html            # Frontend test page
└── testsupabase.html    # Supabase connection test
```

## 🛠️ Tech Stack
- **Frontend**: HTML5, Modern CSS, Vanilla JavaScript
- **Backend**: Supabase (Auth, Database, Storage)
- **Animations**: GSAP
- **Icons**: Lucide Icons
- **Payments**: Stripe, PayPal, MonCash

## 📦 Installation

### Prerequisites
- Modern web browser
- Local web server (e.g., Live Server, Python HTTP server)
- Supabase account

### Setup Steps

1. **Clone/Download the project**
   ```bash
   cd hansypix
   ```

2. **Configure Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update `/src/supabase/config.js` with your credentials:
     ```javascript
     const SUPABASE_URL = 'your-project-url';
     const SUPABASE_ANON_KEY = 'your-anon-key';
     ```

3. **Setup Database**
   - Go to Supabase SQL Editor
   - Run all SQL files in `/sql` folder in this order:
     1. `schema.sql` - Creates tables
     2. `storage.sql` - Sets up storage buckets
     3. `policies.sql` - Configures security policies
     4. `seed.sql` - (Optional) Sample data

4. **Configure Admin Access**
   - Update `ADMIN_EMAIL` in `/src/js/config.js`
   - This email will have admin panel access

5. **Setup Payment Providers**
   - **Stripe**: Add your publishable key in `/src/js/payments/stripe.js`
   - **PayPal**: Add your client ID in `/src/js/payments/paypal.js`
   - **MonCash**: Configure credentials in `/src/js/payments/moncash.js`

6. **Add Media Assets**
   - Place hero video in `/public/videos/hero-video.mp4`
   - Add images to `/public/images/`
   - Upload portfolio items via admin panel

7. **Run the Project**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server -p 8000
   
   # Using VS Code Live Server
   Right-click index.html → Open with Live Server
   ```

8. **Access the Website**
   - Frontend: `http://localhost:8000/src/pages/index.html`
   - Test Page: `http://localhost:8000/test.html`
   - Supabase Test: `http://localhost:8000/testsupabase.html`

## 🔐 Admin Panel Access

1. Register an account using the admin email
2. Login with admin credentials
3. Admin button will appear in navigation
4. Access: `/src/pages/admin/dashboard.html`

### Admin Features
- **Dashboard**: Overview and analytics
- **Portfolio Manager**: Upload/manage photos and videos
- **Site Settings**: Edit homepage content and pricing
- **Users**: Manage user accounts
- **Messages**: View and respond to customer messages

## 🧪 Testing

### Frontend Test
Navigate to `test.html` to verify:
- ✅ All CSS files load correctly
- ✅ JavaScript files execute
- ✅ Icons and fonts load
- ✅ Responsive design works

### Supabase Test
Navigate to `testsupabase.html` to verify:
- ✅ Database connection
- ✅ Authentication system
- ✅ Storage buckets
- ✅ Real-time subscriptions

## 📱 Mobile Experience
The mobile version features:
- Bottom navigation bar with modern icons
- App-like interactions
- Optimized touch targets
- Smooth transitions
- Pull-to-refresh support

## 🎨 Design Features
- **Dark Theme**: Black background with white/gray text
- **Glassmorphism**: Frosted glass effects
- **Parallax Scrolling**: Depth and immersion
- **Smooth Animations**: GSAP-powered transitions
- **Video Backgrounds**: Cinematic hero sections
- **Luxury Typography**: Premium font pairings

## 🔒 Security
- Row Level Security (RLS) enabled
- Admin-only routes protected
- Secure authentication flow
- Environment variables for sensitive data
- XSS protection
- CSRF tokens for forms

## 💳 Payment Integration

### Stripe
- Credit/debit card processing
- Secure checkout flow
- Webhook support for order confirmation

### PayPal
- PayPal account payments
- Guest checkout option

### MonCash (Haiti)
- Mobile money integration
- Local payment support

## 📊 Database Schema

### Tables
- `users` - User accounts and profiles
- `portfolio` - Photos and videos
- `messages` - Chat messages
- `payments` - Transaction records
- `settings` - Site configuration
- `bookings` - Session bookings

## 🌐 SEO Optimization
- Semantic HTML5
- Meta tags for social sharing
- Optimized images
- Fast loading times
- Mobile-friendly
- Structured data

## 🚀 Performance
- Lazy loading images
- Optimized assets
- Minimal dependencies
- Efficient animations
- Caching strategies

## 📞 Support
For issues or questions, contact the development team.

## 📄 License
Proprietary - HANSYPIX © 2026

---

**Built with ❤️ for professional photography**
=======
# HANSYPIX - Professional Photography Company Website

## 🎨 Overview
HANSYPIX is a complete, production-ready photography company website featuring modern UI/UX design, real-time chat, admin CMS, and integrated payment systems.

## 🚀 Features
- **Immersive Design**: Glassmorphism, parallax effects, smooth animations
- **Full CMS**: Complete admin panel for content management
- **Real-time Chat**: WhatsApp-style messaging system
- **Payment Integration**: Stripe, PayPal, and MonCash support
- **Responsive**: Mobile-first design with app-like mobile experience
- **Supabase Backend**: Authentication, database, and storage

## 📁 Project Structure
```
/hansypix
├── /public
│   ├── /videos          # Video assets
│   ├── /images          # Image assets
│   └── /icons           # Icon assets
├── /src
│   ├── /pages           # Main website pages
│   ├── /admin           # Admin panel pages
│   ├── /components      # Reusable components
│   ├── /css             # Stylesheets
│   ├── /js              # JavaScript files
│   └── /supabase        # Supabase configuration
├── /sql                 # Database schema files
├── test.html            # Frontend test page
└── testsupabase.html    # Supabase connection test
```

## 🛠️ Tech Stack
- **Frontend**: HTML5, Modern CSS, Vanilla JavaScript
- **Backend**: Supabase (Auth, Database, Storage)
- **Animations**: GSAP
- **Icons**: Lucide Icons
- **Payments**: Stripe, PayPal, MonCash

## 📦 Installation

### Prerequisites
- Modern web browser
- Local web server (e.g., Live Server, Python HTTP server)
- Supabase account

### Setup Steps

1. **Clone/Download the project**
   ```bash
   cd hansypix
   ```

2. **Configure Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update `/src/supabase/config.js` with your credentials:
     ```javascript
     const SUPABASE_URL = 'your-project-url';
     const SUPABASE_ANON_KEY = 'your-anon-key';
     ```

3. **Setup Database**
   - Go to Supabase SQL Editor
   - Run all SQL files in `/sql` folder in this order:
     1. `schema.sql` - Creates tables
     2. `storage.sql` - Sets up storage buckets
     3. `policies.sql` - Configures security policies
     4. `seed.sql` - (Optional) Sample data

4. **Configure Admin Access**
   - Update `ADMIN_EMAIL` in `/src/js/config.js`
   - This email will have admin panel access

5. **Setup Payment Providers**
   - **Stripe**: Add your publishable key in `/src/js/payments/stripe.js`
   - **PayPal**: Add your client ID in `/src/js/payments/paypal.js`
   - **MonCash**: Configure credentials in `/src/js/payments/moncash.js`

6. **Add Media Assets**
   - Place hero video in `/public/videos/hero-video.mp4`
   - Add images to `/public/images/`
   - Upload portfolio items via admin panel

7. **Run the Project**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server -p 8000
   
   # Using VS Code Live Server
   Right-click index.html → Open with Live Server
   ```

8. **Access the Website**
   - Frontend: `http://localhost:8000/src/pages/index.html`
   - Test Page: `http://localhost:8000/test.html`
   - Supabase Test: `http://localhost:8000/testsupabase.html`

## 🔐 Admin Panel Access

1. Register an account using the admin email
2. Login with admin credentials
3. Admin button will appear in navigation
4. Access: `/src/pages/admin/dashboard.html`

### Admin Features
- **Dashboard**: Overview and analytics
- **Portfolio Manager**: Upload/manage photos and videos
- **Site Settings**: Edit homepage content and pricing
- **Users**: Manage user accounts
- **Messages**: View and respond to customer messages

## 🧪 Testing

### Frontend Test
Navigate to `test.html` to verify:
- ✅ All CSS files load correctly
- ✅ JavaScript files execute
- ✅ Icons and fonts load
- ✅ Responsive design works

### Supabase Test
Navigate to `testsupabase.html` to verify:
- ✅ Database connection
- ✅ Authentication system
- ✅ Storage buckets
- ✅ Real-time subscriptions

## 📱 Mobile Experience
The mobile version features:
- Bottom navigation bar with modern icons
- App-like interactions
- Optimized touch targets
- Smooth transitions
- Pull-to-refresh support

## 🎨 Design Features
- **Dark Theme**: Black background with white/gray text
- **Glassmorphism**: Frosted glass effects
- **Parallax Scrolling**: Depth and immersion
- **Smooth Animations**: GSAP-powered transitions
- **Video Backgrounds**: Cinematic hero sections
- **Luxury Typography**: Premium font pairings

## 🔒 Security
- Row Level Security (RLS) enabled
- Admin-only routes protected
- Secure authentication flow
- Environment variables for sensitive data
- XSS protection
- CSRF tokens for forms

## 💳 Payment Integration

### Stripe
- Credit/debit card processing
- Secure checkout flow
- Webhook support for order confirmation

### PayPal
- PayPal account payments
- Guest checkout option

### MonCash (Haiti)
- Mobile money integration
- Local payment support

## 📊 Database Schema

### Tables
- `users` - User accounts and profiles
- `portfolio` - Photos and videos
- `messages` - Chat messages
- `payments` - Transaction records
- `settings` - Site configuration
- `bookings` - Session bookings

## 🌐 SEO Optimization
- Semantic HTML5
- Meta tags for social sharing
- Optimized images
- Fast loading times
- Mobile-friendly
- Structured data

## 🚀 Performance
- Lazy loading images
- Optimized assets
- Minimal dependencies
- Efficient animations
- Caching strategies

## 📞 Support
For issues or questions, contact the development team.

## 📄 License
Proprietary - HANSYPIX © 2026

---

**Built with ❤️ for professional photography**
>>>>>>> a0f94cd2f455cd5b65045c161fc96ba4dddb1da9
