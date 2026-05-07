(() => {
    function safeShowToast(message, type = 'info') {
        try {
            if (typeof showToast === 'function') {
                showToast(message, type);
                return;
            }
        } catch (_) {
            // ignore
        }

        if (type === 'error') console.error(message);
        else console.log(message);
    }

    function getRedirectTarget() {
        const params = new URLSearchParams(window.location.search);
        const raw = params.get('redirect');
        if (!raw) return 'index.html';

        const target = raw.trim();
        if (!target) return 'index.html';

        if (/^https?:\/\//i.test(target) || target.startsWith('//') || /^javascript:/i.test(target)) {
            return 'index.html';
        }

        return target;
    }

    function openModal(modal) {
        if (!modal) return;
        modal.style.display = 'flex';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.style.display = 'none';
    }

    async function ensureUserProfileRow(user) {
        if (!user || typeof supabaseClient === 'undefined' || !supabaseClient) return;

        try {
            const { data, error: fetchError } = await supabaseClient
                .from('users')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (!data) {
                const { error: insertError } = await supabaseClient
                    .from('users')
                    .insert({
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || 'N/A',
                        role: 'customer'
                    });

                if (insertError) throw insertError;
            }
        } catch (err) {
            console.error('Error ensuring user profile:', err);
        }
    }

    function bindPasswordToggle() {
        const password = document.getElementById('password');
        const toggle = document.getElementById('togglePassword');
        if (!password || !toggle) return;

        toggle.addEventListener('click', () => {
            password.type = password.type === 'password' ? 'text' : 'password';
        });
    }

    function bindForgotPassword() {
        const link = document.getElementById('forgotPasswordLink');
        const modal = document.getElementById('forgotPasswordModal');
        const closeBtn = document.getElementById('closeModalBtn');
        const overlay = modal ? modal.querySelector('.modal-overlay') : null;

        if (link && modal) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(modal);
            });
        }

        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => closeModal(modal));
        }

        if (overlay && modal) {
            overlay.addEventListener('click', () => closeModal(modal));
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal(modal);
        });

        const form = document.getElementById('forgotPasswordForm');
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (typeof supabaseClient === 'undefined' || !supabaseClient) {
                safeShowToast('Supabase client not found', 'error');
                return;
            }

            const email = document.getElementById('resetEmail')?.value?.trim() || '';
            if (!email) {
                safeShowToast('Please enter your email', 'warning');
                return;
            }

            try {
                if (submitBtn) submitBtn.disabled = true;

                const origin = window.location.origin;
                const options = {};
                if (origin && origin !== 'null' && /^https?:/i.test(origin)) {
                    options.redirectTo = `${origin}/src/pages/login.html`;
                }

                const { error } = await supabaseClient.auth.resetPasswordForEmail(email, options);
                if (error) throw error;

                safeShowToast('If the email exists, a reset link was sent.', 'success');
                closeModal(modal);
            } catch (err) {
                console.error(err);
                safeShowToast('Failed to send reset link', 'error');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }

    function bindGoogleAuth() {
        const btn = document.getElementById('googleAuthBtn');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            if (typeof supabaseClient === 'undefined' || !supabaseClient) {
                safeShowToast('Supabase client not found', 'error');
                return;
            }

            try {
                btn.disabled = true;

                const origin = window.location.origin;
                const options = {};
                if (origin && origin !== 'null' && /^https?:/i.test(origin)) {
                    options.redirectTo = `${origin}/src/pages/index.html`;
                }

                const { data, error } = await supabaseClient.auth.signInWithOAuth({
                    provider: 'google',
                    options
                });

                if (error) throw error;
            } catch (err) {
                console.error(err);
                safeShowToast('Google login is not available yet.', 'error');
            } finally {
                btn.disabled = false;
            }
        });
    }

    async function bindLoginForm() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        const submitBtn = document.getElementById('loginBtn') || form.querySelector('button[type="submit"]');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (typeof supabaseClient === 'undefined' || !supabaseClient || !supabaseClient.auth) {
                safeShowToast('Supabase client not initialized. Please refresh the page.', 'error');
                console.error('Supabase client not available:', { supabaseClient, hasAuth: supabaseClient?.auth });
                return;
            }

            const email = document.getElementById('email')?.value?.trim() || '';
            const password = document.getElementById('password')?.value || '';

            if (!email || !password) {
                safeShowToast('Please enter your email and password', 'warning');
                return;
            }

            try {
                if (submitBtn) submitBtn.disabled = true;

                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;

                if (data && data.user) {
                    await ensureUserProfileRow(data.user);
                }

                safeShowToast('Logged in successfully', 'success');

                window.location.href = getRedirectTarget();
            } catch (err) {
                console.error(err);
                safeShowToast(err && err.message ? err.message : 'Login failed', 'error');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }

    async function init() {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            window.addEventListener('supabaseReady', () => {
                runInit();
            }, { once: true });
            return;
        }
        runInit();
    }

    async function runInit() {
        try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (user) {
                window.location.href = getRedirectTarget();
                return;
            }
        } catch (_) {
            // ignore
        }

        bindPasswordToggle();
        bindForgotPassword();
        bindGoogleAuth();
        await bindLoginForm();
    }

    document.addEventListener('DOMContentLoaded', () => {
        init().catch((err) => {
            console.error(err);
            safeShowToast('Failed to initialize login page', 'error');
        });
    });
})();
