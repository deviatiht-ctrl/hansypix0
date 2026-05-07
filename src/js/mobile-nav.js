/**
 * MOBILE NAVIGATION CONTROLLER
 * Handles mobile bottom navigation functionality and auth state
 */

console.log('Mobile nav controller loading...');

let mobileNavInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Mobile nav DOMContentLoaded');
    
    // Wait for Supabase to be ready
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        console.log('Waiting for supabaseReady event...');
        window.addEventListener('supabaseReady', () => {
            console.log('Supabase ready event received in mobile-nav');
            if (!mobileNavInitialized) {
                mobileNavInitialized = true;
                initMobileNavigation();
            }
        }, { once: true });
        
        // Fallback polling
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                clearInterval(interval);
                if (!mobileNavInitialized) {
                    mobileNavInitialized = true;
                    initMobileNavigation();
                }
            } else if (attempts >= 50) {
                clearInterval(interval);
                console.error('Supabase failed to load for mobile-nav');
            }
        }, 100);
    } else {
        mobileNavInitialized = true;
        initMobileNavigation();
    }
});

/**
 * Initialize mobile navigation
 */
function initMobileNavigation() {
    console.log('Initializing mobile navigation...');
    const mobileAccountBtn = document.getElementById('mobileAccountBtn');
    const mobileAccountMenu = document.getElementById('mobileAccountMenu');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    const mobileAdminLink = document.getElementById('mobileAdminLink');
    
    if (!mobileAccountBtn) {
        console.warn('mobileAccountBtn not found');
        return;
    }
    
    // Check auth state and update navigation
    console.log('Initial update of mobile navigation...');
    // Small delay to ensure session is loaded
    setTimeout(() => {
        updateMobileNavigation();
    }, 500);
    
    // Listen for auth state changes from Supabase
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed event:', event);
            updateMobileNavigation();
        });
    } else {
        console.warn('Supabase client not found for mobile nav auth listener');
    }
    
    // Toggle Account Menu
    mobileAccountBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('Account button clicked');
        
        const isLoggedIn = await checkAuthState();
        console.log('Is logged in:', isLoggedIn);
        
        if (!isLoggedIn) {
            handleLoginClick();
        } else {
            // Re-verify admin status right before showing menu to be 100% sure
            const adminLink = document.getElementById('mobileAdminLink');
            if (adminLink) {
                console.log('Re-verifying admin status on click...');
                try {
                    const isAdminUser = await checkIsAdmin();
                    if (isAdminUser) {
                        adminLink.style.setProperty('display', 'flex', 'important');
                    } else {
                        adminLink.style.display = 'none';
                    }
                    console.log('Admin link display updated on click:', adminLink.style.display);
                } catch (clickAdminError) {
                    console.error('Error in admin check on click:', clickAdminError);
                }
            }

            if (mobileAccountMenu) {
                const isVisible = mobileAccountMenu.style.display === 'block';
                mobileAccountMenu.style.display = isVisible ? 'none' : 'block';
                console.log('Menu visibility toggled:', !isVisible);
                
                if (!isVisible) {
                    const closeMenu = (e) => {
                        if (mobileAccountMenu && !mobileAccountMenu.contains(e.target) && !mobileAccountBtn.contains(e.target)) {
                            mobileAccountMenu.style.display = 'none';
                            document.removeEventListener('click', closeMenu);
                        }
                    };
                    setTimeout(() => document.addEventListener('click', closeMenu), 10);
                }
            }
        }
    });

    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleLogout();
        });
    }
}

/**
 * Update mobile navigation based on auth state
 */
async function updateMobileNavigation() {
    console.log('--- Mobile Nav Update Start ---');
    const mobileAccountLabel = document.getElementById('mobileAccountLabel');
    const mobileAccountBtn = document.getElementById('mobileAccountBtn');
    const mobileAdminLink = document.getElementById('mobileAdminLink');
    const mobileAdminBtn = document.getElementById('mobileAdminBtn');
    
    if (!mobileAccountLabel || !mobileAccountBtn) {
        console.warn('Crucial mobile nav elements missing');
        return;
    }
    
    try {
        const isLoggedIn = await checkAuthState();
        console.log('Is logged in:', isLoggedIn);
        const icon = mobileAccountBtn.querySelector('i');
        
        if (isLoggedIn) {
            mobileAccountLabel.textContent = 'Account';
            if (icon) {
                icon.setAttribute('data-lucide', 'user');
            }
            
            // Check if user is admin and show admin button/link
            console.log('Checking admin status...');
            
            const showAdminElements = (isAdmin) => {
                if (isAdmin) {
                    // Show admin button in bottom nav
                    if (mobileAdminBtn) {
                        mobileAdminBtn.style.setProperty('display', 'flex', 'important');
                        console.log('Admin button in nav bar displayed');
                    }
                    // Show admin link in menu
                    if (mobileAdminLink) {
                        mobileAdminLink.style.setProperty('display', 'flex', 'important');
                        console.log('Admin link in menu displayed');
                    }
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
            };
            
            // Check admin status with retry
            let isAdminUser = false;
            try {
                isAdminUser = await checkIsAdmin();
                console.log('Admin check result:', isAdminUser);
                showAdminElements(isAdminUser);
            } catch (e) {
                console.error('Error checking admin:', e);
            }
            
            // Retry after delays if not admin yet (session might still be loading)
            if (!isAdminUser) {
                setTimeout(async () => {
                    try {
                        isAdminUser = await checkIsAdmin();
                        if (isAdminUser) showAdminElements(true);
                    } catch (e) {}
                }, 1500);
            }
        } else {
            mobileAccountLabel.textContent = 'Login';
            if (icon) {
                icon.setAttribute('data-lucide', 'log-in');
            }
            
            // Hide admin elements when not logged in
            if (mobileAdminLink) {
                mobileAdminLink.style.display = 'none';
            }
            if (mobileAdminBtn) {
                mobileAdminBtn.style.display = 'none';
            }
        }
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (error) {
        console.error('Error updating mobile navigation:', error);
    }
    console.log('--- Mobile Nav Update End ---');
}

/**
 * Check authentication state
 */
async function checkAuthState() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        console.warn('Supabase client not available for auth check');
        return false;
    }
    
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        return !!session;
    } catch (error) {
        console.error('Error checking auth state:', error);
        return false;
    }
}

/**
 * Check if current user is admin
 */
/**
 * Check if current user is admin
 */
async function checkIsAdmin() {
    console.log('checkIsAdmin: starting check');
    
    // Use the consolidated isAdmin function from config.js if available
    if (typeof window.isAdmin === 'function' || typeof isAdmin === 'function') {
        const adminFn = typeof window.isAdmin === 'function' ? window.isAdmin : isAdmin;
        console.log('checkIsAdmin: calling consolidated isAdmin function');
        try {
            const result = await adminFn();
            console.log('checkIsAdmin: consolidated isAdmin function returned:', result);
            return result;
        } catch (e) {
            console.error('checkIsAdmin: error in consolidated isAdmin function:', e);
        }
    }

    // Direct fallback if for some reason config.js isAdmin isn't ready
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        console.warn('checkIsAdmin: supabaseClient not available');
        return false;
    }
    
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return false;
        
        // Final direct check attempt
        const { data: userData } = await supabaseClient.from('users').select('role').eq('id', user.id).single();
        if (userData && userData.role === 'admin') return true;

        const { data: profileData } = await supabaseClient.from('user_profiles').select('role').eq('id', user.id).single();
        if (profileData && profileData.role === 'admin') return true;
        
        return false;
    } catch (error) {
        console.error('checkIsAdmin: fatal error:', error);
        return false;
    }
}

/**
 * Handle login action
 */
function handleLoginClick() {
    // Use absolute path to ensure it works from any directory
    window.location.href = '/src/pages/login.html';
}

/**
 * Handle logout action
 */
async function handleLogout() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
    
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        
        // Refresh page or update UI
        window.location.reload();
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Error logging out. Please try again.');
    }
}

/**
 * Export functions for use in other scripts
 */
if (typeof window !== 'undefined') {
    window.updateMobileNavigation = updateMobileNavigation;
}
