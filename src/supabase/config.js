/**
 * SUPABASE CONFIGURATION
 * 
 * IMPORTANT: Replace these values with your actual Supabase project credentials
 * Get them from: https://app.supabase.com/project/_/settings/api
 */

const SUPABASE_URL = 'https://rcyyziugbltokxkzzuwg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjeXl6aXVnYmx0b2t4a3p6dXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNDY2NjgsImV4cCI6MjA5MzcyMjY2OH0.NGh7tU4kLIL7O6h79RnBEVtnSUpICsh-PudFqYDMt0A';

/**
 * Initialize Supabase client
 * This will be used throughout the application
 */
var supabaseClient = null;

function initSupabase() {
    if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
        try {
            // Options to help with storage blocking issues in some browsers
            const options = {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            };
            
            // If we're running on a local file system, session persistence might be blocked
            if (window.location.protocol === 'file:') {
                console.warn('Running on file protocol, disabling session persistence to avoid storage block errors');
                options.auth.persistSession = false;
            }

            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);
            window.supabaseClient = supabaseClient; // Ensure it's globally accessible
            console.log('Supabase client initialized successfully');
            
            // Dispatch custom event to notify other scripts that Supabase is ready
            window.dispatchEvent(new CustomEvent('supabaseReady', { detail: supabaseClient }));
            return true;
        } catch (error) {
            console.error('Failed to create Supabase client:', error);
            return false;
        }
    }
    return false;
}

// Initial attempt
if (!initSupabase()) {
    console.log('Waiting for Supabase library to load...');
    // Retry polling
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds total
    const interval = setInterval(() => {
        attempts++;
        if (initSupabase() || attempts >= maxAttempts) {
            clearInterval(interval);
            if (attempts >= maxAttempts && !supabaseClient) {
                console.error('Supabase library failed to load after 5 seconds');
            }
        }
    }, 100);
}

/**
 * Storage bucket names
 */
const STORAGE_BUCKETS = {
    PORTFOLIO: 'portfolio',
    VIDEOS: 'videos',
    AVATARS: 'avatars'
};

if (typeof window !== 'undefined') {
    window.STORAGE_BUCKETS = STORAGE_BUCKETS;
}

/**
 * Check if Supabase is properly configured
 */
function isSupabaseConfigured() {
    return SUPABASE_URL !== 'https://your-project-id.supabase.co' && 
           SUPABASE_ANON_KEY !== 'your-anon-key-here';
}

/**
 * Get current user session
 */
async function getCurrentUser() {
    if (!supabaseClient) return null;
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Check if user is authenticated
 */
async function isAuthenticated() {
    const user = await getCurrentUser();
    return user !== null;
}

/**
 * Sign out current user
 */
async function signOut() {
    if (!supabaseClient) return;
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        window.location.href = '/index.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}

/**
 * Export configuration
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        supabaseClient,
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        STORAGE_BUCKETS,
        isSupabaseConfigured,
        getCurrentUser,
        isAuthenticated,
        signOut
    };
}
