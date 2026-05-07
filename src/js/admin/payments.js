(() => {
    let allPayments = [];
    let filteredPayments = [];

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
                return formatDate(dateStr, 'short');
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

    async function loadPayments() {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            safeShowToast('Supabase client not initialized. Please refresh the page.', 'error');
            return;
        }

        const tbody = document.getElementById('paymentsTableBody');
        if (!tbody) return;

        try {
            const { data, error } = await supabaseClient
                .from('payments')
                .select('*, users(full_name, email)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            allPayments = data || [];
            filteredPayments = [...allPayments];

            renderPayments();
            updateStats();
        } catch (err) {
            console.error(err);
            safeShowToast('Failed to load payments', 'error');
            const tbody = document.getElementById('paymentsTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="7" class="error-message">Failed to load payments</td></tr>';
            }
        }
    }

    function updateStats() {
        const total = allPayments.length;
        const pending = allPayments.filter(p => p.payment_status === 'pending').length;

        let totalRevenue = 0;
        allPayments.forEach(p => {
            if (p.payment_status === 'completed') {
                const amt = Number(p.amount);
                if (Number.isFinite(amt)) totalRevenue += amt;
            }
        });

        setText('totalPayments', total);
        setText('pendingPayments', pending);
        setText('totalRevenue', formatMoney(totalRevenue, 'USD'));
    }

    function renderPayments() {
        const tbody = document.getElementById('paymentsTableBody');
        const emptyState = document.getElementById('emptyState');

        if (!tbody) return;

        tbody.innerHTML = '';

        if (filteredPayments.length === 0) {
            if (emptyState) emptyState.style.display = 'flex';
            tbody.innerHTML = '<tr><td colspan="7" class="empty-message">No payments found</td></tr>';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        filteredPayments.forEach(payment => {
            const userName = payment.users && payment.users.full_name ? payment.users.full_name : (payment.users && payment.users.email ? payment.users.email : 'Unknown');
            const statusClass = payment.payment_status === 'completed' ? 'success' : payment.payment_status === 'pending' ? 'warning' : payment.payment_status === 'failed' ? 'danger' : 'secondary';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><code>${payment.transaction_id || '-'}</code></td>
                <td>${userName}</td>
                <td>${formatMoney(payment.amount, payment.currency || 'USD')}</td>
                <td><span class="badge badge-secondary">${payment.payment_method || '-'}</span></td>
                <td><span class="badge badge-${statusClass}">${payment.payment_status || 'pending'}</span></td>
                <td>${formatDateTime(payment.created_at)}</td>
                <td>
                    <button class="icon-btn view-payment-btn" data-payment-id="${payment.id}" title="View Details">
                        <i data-lucide="eye"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Add click handlers to view buttons
        document.querySelectorAll('.view-payment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const paymentId = btn.dataset.paymentId;
                showPaymentDetails(paymentId);
            });
        });

        if (typeof lucide !== 'undefined') {
            try {
                lucide.createIcons();
            } catch (_) {
                // ignore
            }
        }
    }

    async function showPaymentDetails(paymentId) {
        const modal = document.getElementById('paymentModal');
        const content = document.getElementById('paymentDetailsContent');
        
        if (!modal || !content) return;

        try {
            const payment = allPayments.find(p => p.id === paymentId);
            if (!payment) throw new Error('Payment not found');

            const userName = payment.users && payment.users.full_name ? payment.users.full_name : 'Unknown';
            const userEmail = payment.users && payment.users.email ? payment.users.email : '';

            content.innerHTML = `
                <div class="booking-details-section">
                    <h4><i data-lucide="user"></i> Customer Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Name:</span>
                            <span class="detail-value">${userName}</span>
                        </div>
                        ${userEmail ? `
                        <div class="detail-item">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value">${userEmail}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="booking-details-section">
                    <h4><i data-lucide="credit-card"></i> Payment Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Transaction ID:</span>
                            <span class="detail-value"><code>${payment.transaction_id || '-'}</code></span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Amount:</span>
                            <span class="detail-value" style="font-weight: 600; color: var(--color-accent);">${formatMoney(payment.amount, payment.currency || 'USD')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Payment Method:</span>
                            <span class="detail-value">${payment.payment_method || '-'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">${payment.payment_status || 'pending'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Date:</span>
                            <span class="detail-value">${formatDateTime(payment.created_at)}</span>
                        </div>
                        ${payment.booking_id ? `
                        <div class="detail-item">
                            <span class="detail-label">Booking ID:</span>
                            <span class="detail-value"><code>${payment.booking_id}</code></span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                ${payment.payment_details ? `
                <div class="booking-details-section">
                    <h4><i data-lucide="info"></i> Additional Details</h4>
                    <pre style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; overflow-x: auto;">${JSON.stringify(payment.payment_details, null, 2)}</pre>
                </div>
                ` : ''}

                <div class="modal-actions" style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
                    <button class="btn-secondary" onclick="closePaymentModal()">
                        <i data-lucide="x"></i>
                        Close
                    </button>
                </div>
            `;

            modal.style.display = 'flex';
            
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        } catch (error) {
            console.error('Error showing payment details:', error);
            safeShowToast('Failed to load payment details', 'error');
        }
    }

    function closePaymentModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Make functions globally accessible
    window.closePaymentModal = closePaymentModal;

    function applyFilters() {
        const statusFilter = document.getElementById('statusFilter')?.value || 'all';
        const methodFilter = document.getElementById('methodFilter')?.value || 'all';
        const sortFilter = document.getElementById('sortFilter')?.value || 'newest';
        const searchTerm = document.getElementById('paymentSearch')?.value?.toLowerCase()?.trim() || '';

        filteredPayments = allPayments.filter(payment => {
            if (statusFilter !== 'all' && payment.payment_status !== statusFilter) return false;
            if (methodFilter !== 'all' && payment.payment_method !== methodFilter) return false;

            if (searchTerm) {
                const userName = payment.users && payment.users.full_name ? payment.users.full_name.toLowerCase() : '';
                const userEmail = payment.users && payment.users.email ? payment.users.email.toLowerCase() : '';
                const txId = (payment.transaction_id || '').toLowerCase();

                if (!userName.includes(searchTerm) && !userEmail.includes(searchTerm) && !txId.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });

        if (sortFilter === 'newest') {
            filteredPayments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sortFilter === 'oldest') {
            filteredPayments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (sortFilter === 'amount') {
            filteredPayments.sort((a, b) => {
                const amtA = Number(a.amount) || 0;
                const amtB = Number(b.amount) || 0;
                return amtB - amtA;
            });
        }

        renderPayments();
    }

    function bindFilters() {
        const statusFilter = document.getElementById('statusFilter');
        const methodFilter = document.getElementById('methodFilter');
        const sortFilter = document.getElementById('sortFilter');
        const searchInput = document.getElementById('paymentSearch');

        if (statusFilter) {
            statusFilter.addEventListener('change', applyFilters);
        }

        if (methodFilter) {
            methodFilter.addEventListener('change', applyFilters);
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
        await loadPayments();
        bindFilters();
        
        // Bind modal close button
        const closeBtn = document.getElementById('closePaymentModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', closePaymentModal);
        }
        
        // Close modal when clicking overlay
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    closePaymentModal();
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        init().catch((err) => {
            console.error(err);
            safeShowToast('Failed to initialize payments page', 'error');
        });
    });
})();
