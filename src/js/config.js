/**
 * GLOBAL APPLICATION CONFIGURATION
 * Central configuration file for the HANSYPIX website
 */

const CONFIG = {
    /**
     * Site Information
     */
    SITE_NAME: 'HANSYPIX',
    SITE_TAGLINE: 'Capturing Moments, Creating Memories',
    SITE_DESCRIPTION: 'Professional photography services for studio, outdoor, events, and video production',
    
    /**
     * Contact Information
     */
    CONTACT: {
        email: 'contact@hansypix.com',
        phone: '+1 (555) 123-4567',
        address: '123 Photography Lane, Creative City, CC 12345',
        socialMedia: {
            instagram: 'https://instagram.com/hansypix',
            facebook: 'https://facebook.com/hansypix',
            twitter: 'https://twitter.com/hansypix',
            youtube: 'https://youtube.com/hansypix'
        }
    },
    
    /**
     * Portfolio Categories
     */
    PORTFOLIO_CATEGORIES: [
        { id: 'all', name: 'All', icon: 'grid' },
        { id: 'studio', name: 'Studio', icon: 'camera' },
        { id: 'outdoor', name: 'Outdoor', icon: 'sun' },
        { id: 'events', name: 'Events', icon: 'calendar' },
        { id: 'video', name: 'Video', icon: 'video' }
    ],
    
    /**
     * Pricing Packages
     */
    PRICING_PACKAGES: [
        {
            id: 'basic',
            name: 'Basic Package',
            price: 299,
            currency: 'USD',
            duration: '1 hour',
            features: [
                '1 hour photo session',
                '20 edited photos',
                'Online gallery',
                'Digital download',
                'Personal use license'
            ],
            popular: false
        },
        {
            id: 'professional',
            name: 'Professional Package',
            price: 599,
            currency: 'USD',
            duration: '2 hours',
            features: [
                '2 hour photo session',
                '50 edited photos',
                'Online gallery',
                'Digital download',
                'Print release',
                '2 outfit changes',
                'Location scouting'
            ],
            popular: true
        },
        {
            id: 'premium',
            name: 'Premium Package',
            price: 999,
            currency: 'USD',
            duration: '4 hours',
            features: [
                '4 hour photo session',
                '100+ edited photos',
                'Premium online gallery',
                'Digital download',
                'Full commercial license',
                'Unlimited outfit changes',
                'Multiple locations',
                'Professional makeup artist',
                'Same-day preview'
            ],
            popular: false
        }
    ],
    
    /**
     * Animation Settings
     */
    ANIMATION: {
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.1
    },
    
    /**
     * Pagination
     */
    PAGINATION: {
        portfolioItemsPerPage: 12,
        messagesPerPage: 20
    },
    
    /**
     * File Upload Limits
     */
    UPLOAD: {
        maxImageSize: 10 * 1024 * 1024, // 10MB
        maxVideoSize: 100 * 1024 * 1024, // 100MB
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime']
    },
    
    /**
     * Chat Configuration
     */
    CHAT: {
        maxMessageLength: 1000,
        refreshInterval: 3000, // 3 seconds
        typingIndicatorTimeout: 3000
    },
    
    /**
     * Payment Providers
     */
    PAYMENT_PROVIDERS: {
        stripe: {
            enabled: true,
            name: 'Credit/Debit Card',
            icon: 'credit-card'
        },
        paypal: {
            enabled: true,
            name: 'PayPal',
            icon: 'paypal'
        },
        moncash: {
            enabled: true,
            name: 'MonCash',
            icon: 'smartphone'
        }
    },
    
    /**
     * Stripe Configuration
     * Get your publishable key from: https://dashboard.stripe.com/apikeys
     * Use test key (pk_test_...) for development, live key (pk_live_...) for production
     */
    STRIPE_PUBLISHABLE_KEY: 'pk_live_51SjGATPfMGeEoaS24lW7T63RhGkfY7INpyqwE3KIGyZJUPcnVNvlgGjrrAFki454u2QXjP51fHlidxt2m2TrtfrT008KRkgBvn',
    
    /**
     * Map Configuration (Google Maps)
     */
    MAP: {
        center: { lat: 40.7128, lng: -74.0060 }, // New York (example)
        zoom: 15,
        styles: 'dark' // Dark theme map
    },
    
    /**
     * SEO Meta Tags
     */
    SEO: {
        keywords: 'photography, professional photographer, studio photography, outdoor photography, event photography, video production',
        ogImage: '/public/images/og-image.jpg',
        twitterCard: 'summary_large_image'
    }
};

/**
 * Utility function to check if current user is admin by fetching role from database
 */
async function isAdmin() {
    try {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            console.warn('isAdmin check: supabaseClient not available');
            return false;
        }
        
        const user = await getCurrentUser();
        if (!user) {
            console.log('isAdmin check: no authenticated user found');
            return false;
        }

        console.log('isAdmin check: verifying role for user ID:', user.id);

        // Try 'users' table first
        const { data: userData, error: userError } = await supabaseClient
            .from('users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle(); // Use maybeSingle to avoid error if not found

        if (userError) {
            console.warn('isAdmin check: error querying "users" table:', userError);
        }

        if (userData) {
            console.log('isAdmin check: found user record in "users" table:', userData);
            if (userData.role === 'admin') {
                console.log('isAdmin check: role is admin (verified)');
                return true;
            }
        }

        // Try 'user_profiles' table as fallback
        console.log('isAdmin check: trying "user_profiles" table fallback');
        const { data: profileData, error: profileError } = await supabaseClient
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
        
        if (profileError) {
            console.warn('isAdmin check: error querying "user_profiles" table:', profileError);
        }

        if (profileData) {
            console.log('isAdmin check: found user record in "user_profiles" table:', profileData);
            if (profileData.role === 'admin') {
                console.log('isAdmin check: role is admin in profile (verified)');
                return true;
            }
        }

        console.log('isAdmin check: no admin role found for this user');
        return false;
    } catch (error) {
        console.error('Error in isAdmin check:', error);
        return false;
    }
}

// Expose to window for other scripts
window.isAdmin = isAdmin;

/**
 * Format currency
 */
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Format date
 */
function formatDate(date, format = 'long') {
    const options = format === 'long' 
        ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { year: 'numeric', month: 'short', day: 'numeric' };
    
    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Export configuration
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        isAdmin,
        formatCurrency,
        formatDate,
        debounce,
        showToast
    };
}
