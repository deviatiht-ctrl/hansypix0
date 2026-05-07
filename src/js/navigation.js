/**
 * NAVIGATION FUNCTIONALITY
 * Handles navbar behavior and mobile menu
 */

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initUserMenu();
    initMobileMenu();
});

/**
 * Initialize navigation behavior
 */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    
    if (!navbar) return;
    
    // Navbar scroll behavior
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // Active link highlighting
    highlightActiveLink();
}

/**
 * Highlight active navigation link based on current page
 */
function highlightActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        
        if (currentPath === linkPath || 
            (currentPath.includes(linkPath) && linkPath !== '/')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Initialize user menu functionality
 */
async function initUserMenu() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userMenu = document.getElementById('userMenu');
    const adminLink = document.getElementById('adminLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const topNavBookings = document.getElementById('topNavBookings');
    
    // Mobile menu elements (legacy - some moved to mobile-nav.js)
    const mobileUserMenu = document.getElementById('mobileUserMenu');
    const mobileUserMenuProfile = document.getElementById('mobileUserMenuProfile');
    const mobileAdminLink = document.getElementById('mobileAdminLink');
    const mobileAdminLinkTop = document.getElementById('mobileAdminLinkTop');
    
    if (!userMenu) return;
    
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        window.addEventListener('supabaseReady', () => {
            runUserMenuInit();
        }, { once: true });
        return;
    }
    
    runUserMenuInit();

    async function runUserMenuInit() {
        try {
            // Check if user is logged in
            const user = await getCurrentUser();
            
            if (user) {
                // Hide auth buttons, show user menu (desktop)
                if (loginBtn) loginBtn.style.display = 'none';
                if (registerBtn) registerBtn.style.display = 'none';
                userMenu.style.display = 'block';
                
                // Show My Bookings in top nav for logged in users
                if (topNavBookings) {
                    topNavBookings.style.display = 'block';
                }
                
                // Check if user is admin
                const admin = await isAdmin();
                if (admin && adminLink) {
                    adminLink.style.display = 'flex';
                }
                if (admin && mobileAdminLink) {
                    mobileAdminLink.style.display = 'block';
                }
                if (admin && mobileAdminLinkTop) {
                    mobileAdminLinkTop.style.display = 'block';
                }
                
                // Show chat widget for logged in users
                const chatWidget = document.getElementById('chatWidget');
                if (chatWidget) {
                    chatWidget.style.display = 'block';
                }
            } else {
                // Show auth buttons, hide user menu (desktop)
                if (loginBtn) loginBtn.style.display = 'inline-flex';
                if (registerBtn) registerBtn.style.display = 'inline-flex';
                userMenu.style.display = 'none';
                
                // Hide My Bookings in top nav for logged out users
                if (topNavBookings) {
                    topNavBookings.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error initializing user menu:', error);
        }
    }
    
    // Logout handler (desktop)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await signOut();
        });
    }
}

/**
 * Initialize mobile menu
 */
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    
    if (!mobileMenuToggle || !navMenu) return;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'nav-menu-overlay';
    document.body.appendChild(overlay);
    
    // Toggle menu
    const toggleMenu = () => {
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    };
    
    mobileMenuToggle.addEventListener('click', toggleMenu);
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMenu);
    }
    
    // Close on overlay click
    overlay.addEventListener('click', toggleMenu);
    
    // Close on link click
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
}

/**
 * Update active state on mobile bottom nav
 */
function updateMobileNavActive() {
    const currentPath = window.location.pathname;
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    
    mobileNavItems.forEach(item => {
        const itemPath = new URL(item.href).pathname;
        
        if (currentPath === itemPath || 
            (currentPath.includes(itemPath) && itemPath !== '/')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Update mobile nav on page load
if (document.querySelector('.mobile-bottom-nav')) {
    updateMobileNavActive();
}
