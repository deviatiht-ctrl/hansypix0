(() => {
    let allUsers = [];
    let filteredUsers = [];

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

    function setText(id, text) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = text == null ? '' : String(text);
    }

    function setHtml(id, html) {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = html == null ? '' : String(html);
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return '-';

        if (typeof formatDate === 'function') {
            try {
                return formatDate(dateStr, 'short');
            } catch (_) {
                // ignore
            }
        }

        try {
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }).format(new Date(dateStr));
        } catch (_) {
            return String(dateStr);
        }
    }

    function openModal(modal) {
        if (!modal) return;
        modal.style.display = 'flex';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.style.display = 'none';
    }

    async function loadUsers() {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            safeShowToast('Supabase client not initialized. Please refresh the page.', 'error');
            return;
        }

        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        try {
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            allUsers = data || [];
            filteredUsers = [...allUsers];

            renderUsers();
            updateStats();
        } catch (err) {
            console.error(err);
            safeShowToast('Failed to load users', 'error');
            const tbody = document.getElementById('usersTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" class="error-message">Failed to load users</td></tr>';
            }
        }
    }

    function updateStats() {
        const total = allUsers.length;
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const activeThisMonth = allUsers.filter(u => {
            const created = new Date(u.created_at);
            return created >= oneMonthAgo;
        }).length;

        const newThisWeek = allUsers.filter(u => {
            const created = new Date(u.created_at);
            return created >= oneWeekAgo;
        }).length;

        setText('totalUsers', total);
        setText('activeUsers', activeThisMonth);
        setText('newUsers', newThisWeek);
    }

    function renderUsers() {
        const tbody = document.getElementById('usersTableBody');
        const emptyState = document.getElementById('emptyState');

        if (!tbody) return;

        tbody.innerHTML = '';

        if (filteredUsers.length === 0) {
            if (emptyState) emptyState.style.display = 'flex';
            tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No users found</td></tr>';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        filteredUsers.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div class="user-avatar-small">
                            <i data-lucide="user"></i>
                        </div>
                        <span>${user.full_name || 'N/A'}</span>
                    </div>
                </td>
                <td>${user.email || '-'}</td>
                <td>${user.phone || '-'}</td>
                <td><span class="badge badge-${user.role === 'admin' ? 'primary' : 'secondary'}">${user.role || 'customer'}</span></td>
                <td>${formatDateTime(user.created_at)}</td>
                <td>
                    <button class="icon-btn" data-user-id="${user.id}" title="View Details">
                        <i data-lucide="eye"></i>
                    </button>
                </td>
            `;

            const viewBtn = row.querySelector('.icon-btn');
            if (viewBtn) {
                viewBtn.addEventListener('click', () => showUserDetails(user));
            }

            tbody.appendChild(row);
        });

        if (typeof lucide !== 'undefined') {
            try {
                lucide.createIcons();
            } catch (_) {
                // ignore
            }
        }
    }

    async function showUserDetails(user) {
        const modal = document.getElementById('userDetailsModal');
        if (!modal) return;

        setText('userName', user.full_name || 'N/A');
        setText('userEmail', user.email || '-');
        setText('userPhone', user.phone || '-');
        setText('userRole', user.role || 'customer');
        setText('userJoined', formatDateTime(user.created_at));

        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const { count } = await supabaseClient
                    .from('bookings')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                setText('userBookings', count || 0);
            } catch (_) {
                setText('userBookings', '0');
            }
        }

        openModal(modal);

        if (typeof lucide !== 'undefined') {
            try {
                lucide.createIcons();
            } catch (_) {
                // ignore
            }
        }
    }

    function applyFilters() {
        const roleFilter = document.getElementById('roleFilter')?.value || 'all';
        const sortFilter = document.getElementById('sortFilter')?.value || 'newest';
        const searchTerm = document.getElementById('userSearch')?.value?.toLowerCase()?.trim() || '';

        filteredUsers = allUsers.filter(user => {
            if (roleFilter !== 'all' && user.role !== roleFilter) return false;

            if (searchTerm) {
                const name = (user.full_name || '').toLowerCase();
                const email = (user.email || '').toLowerCase();
                const phone = (user.phone || '').toLowerCase();

                if (!name.includes(searchTerm) && !email.includes(searchTerm) && !phone.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });

        if (sortFilter === 'newest') {
            filteredUsers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sortFilter === 'oldest') {
            filteredUsers.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (sortFilter === 'name') {
            filteredUsers.sort((a, b) => {
                const nameA = (a.full_name || '').toLowerCase();
                const nameB = (b.full_name || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });
        }

        renderUsers();
    }

    function bindFilters() {
        const roleFilter = document.getElementById('roleFilter');
        const sortFilter = document.getElementById('sortFilter');
        const searchInput = document.getElementById('userSearch');

        if (roleFilter) {
            roleFilter.addEventListener('change', applyFilters);
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', applyFilters);
        }

        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(applyFilters, 300);
            });
        }
    }

    function bindModals() {
        const modal = document.getElementById('userDetailsModal');
        const closeBtn = document.getElementById('closeUserModal');
        const closeBtn2 = document.getElementById('closeUserDetailsBtn');
        const viewBookingsBtn = document.getElementById('viewUserBookings');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal));
        }

        if (closeBtn2) {
            closeBtn2.addEventListener('click', () => closeModal(modal));
        }

        if (viewBookingsBtn) {
            viewBookingsBtn.addEventListener('click', () => {
                window.location.href = 'bookings.html';
            });
        }

        if (modal) {
            const overlay = modal.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => closeModal(modal));
            }
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal(modal);
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
        await loadUsers();
        bindFilters();
        bindModals();
    }

    document.addEventListener('DOMContentLoaded', () => {
        init().catch((err) => {
            console.error(err);
            safeShowToast('Failed to initialize users page', 'error');
        });
    });
})();
