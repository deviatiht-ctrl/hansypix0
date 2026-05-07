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

    function getRedirectParam() {
        const page = window.location.pathname.split('/').slice(-2).join('/');
        const qs = window.location.search || '';
        return `${page}${qs}`;
    }

    function redirectToLogin() {
        const redirect = encodeURIComponent(getRedirectParam());
        window.location.href = `/src/pages/login.html?redirect=${redirect}`;
    }

    function redirectToHome() {
        window.location.href = '/src/pages/index.html';
    }

    function initSidebar() {
        const sidebar = document.getElementById('adminSidebar');
        const toggle = document.getElementById('mobileSidebarToggle');

        if (!sidebar || !toggle) return;

        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.background = 'rgba(0, 0, 0, 0.65)';
        overlay.style.zIndex = '10';
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        overlay.style.pointerEvents = 'none';
        overlay.style.transition = 'all 0.2s ease';
        document.body.appendChild(overlay);

        const open = () => {
            sidebar.classList.add('active');
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
            overlay.style.pointerEvents = 'auto';
        };

        const close = () => {
            sidebar.classList.remove('active');
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            overlay.style.pointerEvents = 'none';
        };

        toggle.addEventListener('click', () => {
            if (sidebar.classList.contains('active')) close();
            else open();
        });

        overlay.addEventListener('click', close);

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                close();
            }
        });
    }

    function initLogout() {
        const logoutBtn = document.getElementById('adminLogout');
        if (!logoutBtn) return;

        logoutBtn.addEventListener('click', async () => {
            if (typeof signOut === 'function') {
                await signOut();
                return;
            }

            if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                try {
                    await supabaseClient.auth.signOut();
                } catch (_) {
                    // ignore
                }
            }

            redirectToHome();
        });
    }

    function setAdminName(user) {
        const nameEl = document.getElementById('adminUserName');
        if (!nameEl) return;

        const meta = user && user.user_metadata ? user.user_metadata : {};
        const fullName = meta.full_name || meta.fullName || null;
        nameEl.textContent = fullName || (user && user.email ? user.email : 'Admin');
    }

    async function initAuthCheck() {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            window.addEventListener('supabaseReady', () => {
                runAuthCheck();
            }, { once: true });
            return;
        }
        runAuthCheck();
    }

    async function runAuthCheck() {
        if (typeof getCurrentUser !== 'function') {
            safeShowToast('Authentication utility not found. Please refresh the page.', 'error');
            redirectToHome();
            return;
        }

        const user = await getCurrentUser();
        if (!user) {
            redirectToLogin();
            return;
        }

        setAdminName(user);

        if (typeof isAdmin === 'function') {
            const admin = await isAdmin();
            if (!admin) {
                safeShowToast('Access denied. Admin only.', 'error');
                redirectToHome();
                return;
            }
        }

        initSidebar();
        initLogout();
    }

    document.addEventListener('DOMContentLoaded', () => {
        initAuthCheck().catch((err) => {
            console.error(err);
            safeShowToast('Failed to validate admin session', 'error');
            redirectToHome();
        });
    });
})();
