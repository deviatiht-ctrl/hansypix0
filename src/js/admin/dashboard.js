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

    function formatMoney(amount, currency = 'USD') {
        const n = Number(amount);
        if (!Number.isFinite(n)) return currency === 'USD' ? '$0' : `0 ${currency}`;

        if (typeof formatCurrency === 'function') {
            try {
                return formatCurrency(n, currency);
            } catch (_) {
                // ignore
            }
        }

        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency
            }).format(n);
        } catch (_) {
            return `${n.toFixed(2)} ${currency}`;
        }
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return '-';

        if (typeof formatDate === 'function') {
            try {
                return formatDate(dateStr, 'long');
            } catch (_) {
                // ignore
            }
        }

        try {
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(dateStr));
        } catch (_) {
            return String(dateStr);
        }
    }

    async function loadStats() {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            safeShowToast('Supabase client not initialized', 'error');
            return;
        }

        try {
            const [portfolioRes, bookingsRes, usersRes, paymentsRes] = await Promise.all([
                supabaseClient.from('portfolio').select('id', { count: 'exact', head: true }),
                supabaseClient.from('bookings').select('id', { count: 'exact', head: true }),
                supabaseClient.from('users').select('id', { count: 'exact', head: true }),
                supabaseClient.from('payments').select('amount, currency').eq('payment_status', 'completed')
            ]);

            setText('totalPortfolioItems', portfolioRes.count || 0);
            setText('totalBookings', bookingsRes.count || 0);
            setText('totalUsers', usersRes.count || 0);

            let totalRevenue = 0;
            if (paymentsRes.data && Array.isArray(paymentsRes.data)) {
                totalRevenue = paymentsRes.data.reduce((sum, p) => {
                    const amt = Number(p.amount);
                    return sum + (Number.isFinite(amt) ? amt : 0);
                }, 0);
            }

            setText('totalRevenue', formatMoney(totalRevenue, 'USD'));
        } catch (err) {
            console.error(err);
            safeShowToast('Failed to load stats', 'error');
        }
    }

    async function loadRecentBookings() {
        const container = document.getElementById('recentBookings');
        if (!container || typeof supabaseClient === 'undefined' || !supabaseClient) return;

        try {
            const { data, error } = await supabaseClient
                .from('bookings')
                .select('*, users(full_name, email)')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;

            container.innerHTML = '';

            if (!data || data.length === 0) {
                container.innerHTML = '<p class="empty-message">No recent bookings</p>';
                return;
            }

            data.forEach(booking => {
                const userName = booking.users && booking.users.full_name ? booking.users.full_name : (booking.users && booking.users.email ? booking.users.email : 'Unknown');
                const statusClass = booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : 'info';

                const item = document.createElement('div');
                item.className = 'activity-item';
                item.innerHTML = `
                    <div class="activity-icon ${statusClass}">
                        <i data-lucide="calendar"></i>
                    </div>
                    <div class="activity-details">
                        <h4>${userName}</h4>
                        <p>${booking.package_name || 'Package'} - ${booking.preferred_date || 'TBD'}</p>
                        <small>${formatDateTime(booking.created_at)}</small>
                    </div>
                    <span class="badge badge-${statusClass}">${booking.status || 'pending'}</span>
                `;

                container.appendChild(item);
            });

            if (typeof lucide !== 'undefined') {
                try {
                    lucide.createIcons();
                } catch (_) {
                    // ignore
                }
            }
        } catch (err) {
            console.error(err);
            container.innerHTML = '<p class="error-message">Failed to load bookings</p>';
        }
    }

    async function loadRecentMessages() {
        const container = document.getElementById('recentMessages');
        if (!container || typeof supabaseClient === 'undefined' || !supabaseClient) return;

        try {
            const { data, error } = await supabaseClient
                .from('messages')
                .select('*, users(full_name, email)')
                .eq('sender_type', 'user')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;

            container.innerHTML = '';

            if (!data || data.length === 0) {
                container.innerHTML = '<p class="empty-message">No recent messages</p>';
                return;
            }

            data.forEach(msg => {
                const userName = msg.users && msg.users.full_name ? msg.users.full_name : (msg.users && msg.users.email ? msg.users.email : 'Unknown');
                const preview = msg.message_text && msg.message_text.length > 50 ? msg.message_text.substring(0, 50) + '...' : (msg.message_text || '');
                const readClass = msg.is_read ? '' : 'unread';

                const item = document.createElement('div');
                item.className = `activity-item ${readClass}`;
                item.innerHTML = `
                    <div class="activity-icon blue">
                        <i data-lucide="message-circle"></i>
                    </div>
                    <div class="activity-details">
                        <h4>${userName}</h4>
                        <p>${preview}</p>
                        <small>${formatDateTime(msg.created_at)}</small>
                    </div>
                    ${msg.is_read ? '' : '<span class="badge badge-primary">New</span>'}
                `;

                container.appendChild(item);
            });

            if (typeof lucide !== 'undefined') {
                try {
                    lucide.createIcons();
                } catch (_) {
                    // ignore
                }
            }
        } catch (err) {
            console.error(err);
            container.innerHTML = '<p class="error-message">Failed to load messages</p>';
        }
    }

    function initCharts() {
        if (typeof Chart === 'undefined') return;

        const bookingsCanvas = document.getElementById('bookingsChart');
        const revenueCanvas = document.getElementById('revenueChart');

        if (bookingsCanvas) {
            new Chart(bookingsCanvas, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Bookings',
                        data: [12, 19, 15, 22],
                        borderColor: 'rgba(201, 169, 97, 1)',
                        backgroundColor: 'rgba(201, 169, 97, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }

        if (revenueCanvas) {
            new Chart(revenueCanvas, {
                type: 'bar',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Revenue',
                        data: [3500, 5200, 4800, 6100],
                        backgroundColor: 'rgba(201, 169, 97, 0.8)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
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
        await loadStats();
        await Promise.all([
            loadRecentBookings(),
            loadRecentMessages()
        ]);
        initCharts();
    }

    document.addEventListener('DOMContentLoaded', () => {
        init().catch((err) => {
            console.error(err);
            safeShowToast('Failed to initialize dashboard', 'error');
        });
    });
})();
