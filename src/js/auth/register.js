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

    async function ensureUserProfileRow(user, profile) {
        if (!user || typeof supabaseClient === 'undefined' || !supabaseClient) return;

        try {
            await supabaseClient
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: profile.fullName || null,
                    phone: profile.phone || null
                }, { onConflict: 'id' });
        } catch (err) {
            console.error('Error ensuring user profile row:', err);
        }
    }

    function bindPasswordToggle(inputId, toggleId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        if (!input || !toggle) return;

        toggle.addEventListener('click', () => {
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    }

    function calcStrength(password) {
        const p = String(password || '');
        let score = 0;
        if (p.length >= 8) score += 1;
        if (/[A-Z]/.test(p)) score += 1;
        if (/[0-9]/.test(p)) score += 1;
        if (/[^A-Za-z0-9]/.test(p)) score += 1;

        if (score <= 1) return 'weak';
        if (score === 2 || score === 3) return 'medium';
        return 'strong';
    }

    function bindPasswordStrength() {
        const password = document.getElementById('password');
        const fill = document.getElementById('strengthFill');
        const text = document.getElementById('strengthText');
        if (!password || !fill || !text) return;

        const update = () => {
            const value = password.value || '';

            fill.classList.remove('weak', 'medium', 'strong');

            if (!value) {
                text.textContent = 'Enter a password';
                fill.style.width = '0';
                return;
            }

            const strength = calcStrength(value);
            fill.classList.add(strength);

            if (strength === 'weak') text.textContent = 'Weak password';
            else if (strength === 'medium') text.textContent = 'Medium strength';
            else text.textContent = 'Strong password';
        };

        password.addEventListener('input', update);
        update();
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
                    const redirectTarget = getRedirectTarget();
                    options.redirectTo = `${origin}/src/pages/login.html?redirect=${encodeURIComponent(redirectTarget)}`;
                }

                const { error } = await supabaseClient.auth.signInWithOAuth({
                    provider: 'google',
                    options
                });

                if (error) throw error;
            } catch (err) {
                console.error(err);
                safeShowToast('Google sign up is not available yet.', 'error');
            } finally {
                btn.disabled = false;
            }
        });
    }

    function getFormProfile() {
        const fullName = document.getElementById('fullName')?.value?.trim() || '';
        const email = document.getElementById('email')?.value?.trim() || '';
        const phone = document.getElementById('phone')?.value?.trim() || '';
        const password = document.getElementById('password')?.value || '';
        const confirmPassword = document.getElementById('confirmPassword')?.value || '';
        const agree = Boolean(document.getElementById('agreeTerms')?.checked);

        return { fullName, email, phone, password, confirmPassword, agree };
    }

    async function bindRegisterForm() {
        const form = document.getElementById('registerForm');
        if (!form) return;

        const submitBtn = document.getElementById('registerBtn') || form.querySelector('button[type="submit"]');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (typeof supabaseClient === 'undefined' || !supabaseClient || !supabaseClient.auth) {
                safeShowToast('Supabase client not initialized. Please refresh the page.', 'error');
                console.error('Supabase client not available:', { supabaseClient, hasAuth: supabaseClient?.auth });
                return;
            }

            const profile = getFormProfile();

            if (!profile.fullName || !profile.email || !profile.password || !profile.confirmPassword) {
                safeShowToast('Please fill in all required fields', 'warning');
                return;
            }

            if (!profile.agree) {
                safeShowToast('Please agree to the terms to continue', 'warning');
                return;
            }

            if (profile.password !== profile.confirmPassword) {
                safeShowToast('Passwords do not match', 'error');
                return;
            }

            try {
                if (submitBtn) submitBtn.disabled = true;

                const { data, error } = await supabaseClient.auth.signUp({
                    email: profile.email,
                    password: profile.password,
                    options: {
                        data: {
                            full_name: profile.fullName,
                            phone: profile.phone || null
                        }
                    }
                });

                if (error) throw error;

                if (data && data.user && data.session) {
                    await ensureUserProfileRow(data.user, profile);
                    safeShowToast('Account created successfully', 'success');
                    window.location.href = getRedirectTarget();
                    return;
                }

                safeShowToast('Check your email to confirm your account, then log in.', 'success');
                window.location.href = '/src/pages/login.html';
            } catch (err) {
                console.error(err);
                safeShowToast(err && err.message ? err.message : 'Registration failed', 'error');
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

        bindPasswordToggle('password', 'togglePassword');
        bindPasswordToggle('confirmPassword', 'toggleConfirmPassword');
        bindPasswordStrength();
        bindGoogleAuth();
        await bindRegisterForm();
    }

    document.addEventListener('DOMContentLoaded', () => {
        init().catch((err) => {
            console.error(err);
            safeShowToast('Failed to initialize register page', 'error');
        });
    });
})();
