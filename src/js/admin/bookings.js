(() => {
    let allBookings = [];
    let filteredBookings = [];
    let currentEmailBooking = null;
    let currentEmailType = 'confirmation';

    const emailTemplates = {
        confirmation: {
            subject: 'HANSYPIX - Konfimasyon RezÃ¨vasyon Ou',
            getMessage: (booking, userName) => `
ChÃ¨ ${userName},

Nou kontan enfÃ²me ou ke rezÃ¨vasyon ou a konfime!

Nou tann ou ak enpasyans pou sesyon foto ou a. Tanpri asire ou ke ou rive 10-15 minit anvan lÃ¨ randevou a.

Si ou gen nenpÃ²t kesyon oswa ou bezwen fÃ¨ chanjman, pa ezite kontakte nou.

MÃ¨si paske ou chwazi HANSYPIX!

KÃ²dyalman,
Ekip HANSYPIX
            `
        },
        pending: {
            subject: 'HANSYPIX - RezÃ¨vasyon Ou An Atant',
            getMessage: (booking, userName) => `
ChÃ¨ ${userName},

Nou resevwa demann rezÃ¨vasyon ou a e li an atant kounye a.

Nou pral revize detay yo epi kontakte ou nan pi vit posib pou konfime rezÃ¨vasyon an.

Si ou gen nenpÃ²t kesyon, tanpri pa ezite kontakte nou.

MÃ¨si pou pasyans ou!

KÃ²dyalman,
Ekip HANSYPIX
            `
        },
        cancellation: {
            subject: 'HANSYPIX - Anilasyon RezÃ¨vasyon',
            getMessage: (booking, userName) => `
ChÃ¨ ${userName},

Nou regrÃ¨t enfÃ²me ou ke rezÃ¨vasyon ou a te anile.

Si ou pa te mande anilasyon sa a oswa si ou ta renmen re-pwograme, tanpri kontakte nou dirÃ¨kteman.

Nou espere gen opÃ²tinite pou sÃ¨vi ou nan lavni.

KÃ²dyalman,
Ekip HANSYPIX
            `
        }
    };

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
                day: 'numeric'
            }).format(new Date(dateStr));
        } catch (_) {
            return String(dateStr);
        }
    }

    async function loadBookings() {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            safeShowToast('Supabase client not initialized. Please refresh the page.', 'error');
            return;
        }

        const tbody = document.getElementById('bookingsTableBody');
        if (!tbody) return;

        try {
            const { data, error } = await supabaseClient
                .from('bookings')
                .select('*, users(full_name, email)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            allBookings = data || [];
            filteredBookings = [...allBookings];

            renderBookings();
            updateStats();
        } catch (err) {
            console.error(err);
            safeShowToast('Failed to load bookings', 'error');
            const tbody = document.getElementById('bookingsTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" class="error-message">Failed to load bookings</td></tr>';
            }
        }
    }

    function updateStats() {
        const total = allBookings.length;
        const pending = allBookings.filter(b => b.status === 'pending').length;
        const confirmed = allBookings.filter(b => b.status === 'confirmed').length;

        setText('totalBookings', total);
        setText('pendingBookings', pending);
        setText('confirmedBookings', confirmed);
    }

    function renderBookings() {
        const tbody = document.getElementById('bookingsTableBody');
        const emptyState = document.getElementById('emptyState');

        if (!tbody) return;

        tbody.innerHTML = '';

        if (filteredBookings.length === 0) {
            if (emptyState) emptyState.style.display = 'flex';
            tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No bookings found</td></tr>';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        filteredBookings.forEach(booking => {
            const userName = booking.users && booking.users.full_name ? booking.users.full_name : (booking.users && booking.users.email ? booking.users.email : 'Unknown');
            const statusClass = booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : booking.status === 'completed' ? 'info' : 'secondary';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${userName}</td>
                <td>${booking.package_name || '-'}</td>
                <td>
                    ${booking.preferred_date || '-'}<br>
                    <small>${booking.preferred_time || '-'}</small>
                </td>
                <td>${booking.location || '-'}</td>
                <td><span class="badge badge-${statusClass}">${booking.status || 'pending'}</span></td>
                <td>
                    <button class="icon-btn view-booking-btn" data-booking-id="${booking.id}" title="View Details">
                        <i data-lucide="eye"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Add click handlers to view buttons
        document.querySelectorAll('.view-booking-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const bookingId = btn.dataset.bookingId;
                showBookingDetails(bookingId);
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

    async function showBookingDetails(bookingId) {
        const modal = document.getElementById('bookingModal');
        const content = document.getElementById('bookingDetailsContent');
        
        if (!modal || !content) return;

        try {
            const booking = allBookings.find(b => b.id === bookingId);
            if (!booking) throw new Error('Booking not found');

            const userName = booking.users && booking.users.full_name ? booking.users.full_name : 'Unknown';
            const userEmail = booking.users && booking.users.email ? booking.users.email : '';
            const packagePrice = parseFloat(booking.package_price || 0);
            const tax = packagePrice * 0.1;
            const total = packagePrice + tax;

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
                    <h4><i data-lucide="calendar"></i> Booking Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Package:</span>
                            <span class="detail-value">${booking.package_name || '-'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Date:</span>
                            <span class="detail-value">${booking.preferred_date || '-'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Time:</span>
                            <span class="detail-value">${booking.preferred_time || '-'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Location:</span>
                            <span class="detail-value">${booking.location || '-'}</span>
                        </div>
                    </div>
                    ${booking.special_requests ? `
                    <div class="detail-item" style="margin-top: 1rem;">
                        <span class="detail-label">Special Requests:</span>
                        <p style="margin-top: 0.5rem; color: var(--color-light-gray);">${booking.special_requests}</p>
                    </div>
                    ` : ''}
                </div>

                <div class="booking-details-section">
                    <h4><i data-lucide="credit-card"></i> Payment Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Package Price:</span>
                            <span class="detail-value">$${packagePrice.toFixed(2)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Tax (10%):</span>
                            <span class="detail-value">$${tax.toFixed(2)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Total:</span>
                            <span class="detail-value" style="font-weight: 600; color: var(--color-accent);">$${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div class="booking-details-section">
                    <h4><i data-lucide="settings"></i> Change Status</h4>
                    <div class="form-group">
                        <label for="bookingStatus">Status:</label>
                        <select id="bookingStatus" class="form-control">
                            <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                        <button class="btn-primary" onclick="updateBookingStatus('${booking.id}')">
                            <i data-lucide="check"></i>
                            Update Status
                        </button>
                        <button class="btn-secondary" onclick="openEmailModal('${booking.id}')" style="display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="mail"></i>
                            Voye Email
                        </button>
                    </div>
                </div>
            `;

            modal.style.display = 'flex';
            
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        } catch (error) {
            console.error('Error showing booking details:', error);
            safeShowToast('Failed to load booking details', 'error');
        }
    }

    async function updateBookingStatus(bookingId) {
        const statusSelect = document.getElementById('bookingStatus');
        if (!statusSelect) return;

        const newStatus = statusSelect.value;

        try {
            const { error } = await supabaseClient
                .from('bookings')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', bookingId);

            if (error) throw error;

            safeShowToast('Booking status updated successfully', 'success');
            closeBookingModal();
            await loadBookings();
        } catch (error) {
            console.error('Error updating booking status:', error);
            safeShowToast('Failed to update booking status: ' + error.message, 'error');
        }
    }

    function closeBookingModal() {
        const modal = document.getElementById('bookingModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    function openEmailModal(bookingId) {
        const booking = allBookings.find(b => b.id === bookingId);
        if (!booking) {
            safeShowToast('RezÃ¨vasyon pa jwenn', 'error');
            return;
        }

        currentEmailBooking = booking;
        
        // Set default email type based on booking status
        if (booking.status === 'confirmed') {
            currentEmailType = 'confirmation';
        } else if (booking.status === 'cancelled') {
            currentEmailType = 'cancellation';
        } else {
            currentEmailType = 'pending';
        }

        updateEmailTypeButtons();
        updateEmailPreview();

        const emailModal = document.getElementById('emailModal');
        if (emailModal) {
            emailModal.style.display = 'flex';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    function closeEmailModal() {
        const modal = document.getElementById('emailModal');
        if (modal) {
            modal.style.display = 'none';
        }
        currentEmailBooking = null;
    }

    function updateEmailTypeButtons() {
        document.querySelectorAll('.email-type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === currentEmailType) {
                btn.classList.add('active');
            }
        });
    }

    function updateEmailPreview() {
        if (!currentEmailBooking) return;

        const preview = document.getElementById('emailPreview');
        const subjectInput = document.getElementById('emailSubject');
        const recipientEl = document.getElementById('emailRecipient');

        const booking = currentEmailBooking;
        const userName = booking.users?.full_name || 'Kliyan';
        const userEmail = booking.users?.email || '';
        const template = emailTemplates[currentEmailType];
        const packagePrice = parseFloat(booking.package_price || 0);
        const tax = packagePrice * 0.1;
        const total = packagePrice + tax;

        // Update subject
        if (subjectInput) {
            subjectInput.value = template.subject;
        }

        // Update recipient
        if (recipientEl) {
            recipientEl.textContent = userEmail || '-';
        }

        // Status badge class
        const statusBadgeClass = currentEmailType === 'confirmation' ? 'confirmed' : 
                                  currentEmailType === 'pending' ? 'pending' : 'cancelled';
        const statusText = currentEmailType === 'confirmation' ? 'Konfime' : 
                           currentEmailType === 'pending' ? 'An Atant' : 'Anile';

        // Generate email preview
        if (preview) {
            preview.innerHTML = `
                <div class="email-header">
                    <img src="/src/logo.png" alt="HANSYPIX Logo" class="email-logo" onerror="this.style.display='none'">
                    <h2 class="email-company-name">HANSYPIX</h2>
                    <p class="email-tagline">Professional Photography Services</p>
                </div>
                
                <div class="email-body">
                    <p class="email-greeting">Bonjou ${userName},</p>
                    
                    <div style="text-align: center;">
                        <span class="status-badge ${statusBadgeClass}">${statusText}</span>
                    </div>
                    
                    <p class="email-message">${template.getMessage(booking, userName).trim().replace(/\n/g, '<br>')}</p>
                    
                    <div class="booking-details-box">
                        <h4>ðŸ“‹ Detay RezÃ¨vasyon</h4>
                        <div class="booking-detail-row">
                            <span class="booking-detail-label">SÃ¨vis:</span>
                            <span class="booking-detail-value">${booking.package_name || '-'}</span>
                        </div>
                        <div class="booking-detail-row">
                            <span class="booking-detail-label">Dat:</span>
                            <span class="booking-detail-value">${booking.preferred_date || '-'}</span>
                        </div>
                        <div class="booking-detail-row">
                            <span class="booking-detail-label">LÃ¨:</span>
                            <span class="booking-detail-value">${booking.preferred_time || '-'}</span>
                        </div>
                        <div class="booking-detail-row">
                            <span class="booking-detail-label">Kote:</span>
                            <span class="booking-detail-value">${booking.location || '-'}</span>
                        </div>
                        <div class="booking-detail-row">
                            <span class="booking-detail-label">Pri:</span>
                            <span class="booking-detail-value">$${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="email-footer">
                    <p><strong>HANSYPIX Photography</strong></p>
                    <p>ðŸ“§ <a href="mailto:contact@hansypix.com" class="company-contact">contact@hansypix.com</a></p>
                    <p>ðŸ“± +1 (555) 123-4567</p>
                    <p style="margin-top: 1rem; font-size: 0.75rem;">Â© 2026 HANSYPIX. Tout dwa rezÃ¨ve.</p>
                </div>
            `;
        }
    }

    function getPlainTextEmail() {
        if (!currentEmailBooking) return '';

        const booking = currentEmailBooking;
        const userName = booking.users?.full_name || 'Kliyan';
        const template = emailTemplates[currentEmailType];
        const packagePrice = parseFloat(booking.package_price || 0);
        const tax = packagePrice * 0.1;
        const total = packagePrice + tax;

        return `
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
           HANSYPIX
   Professional Photography Services
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

${template.getMessage(booking, userName).trim()}

â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ðŸ“‹ DETAY REZÃˆVASYON
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
SÃ¨vis: ${booking.package_name || '-'}
Dat: ${booking.preferred_date || '-'}
LÃ¨: ${booking.preferred_time || '-'}
Kote: ${booking.location || '-'}
Pri Total: $${total.toFixed(2)}
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
HANSYPIX Photography
ðŸ“§ contact@hansypix.com
ðŸ“± +1 (555) 123-4567
Â© 2026 HANSYPIX. Tout dwa rezÃ¨ve.
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        `.trim();
    }

    function copyEmailToClipboard() {
        const text = getPlainTextEmail();
        
        navigator.clipboard.writeText(text).then(() => {
            safeShowToast('Mesaj kopye nan clipboard!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            safeShowToast('Mesaj kopye nan clipboard!', 'success');
        });
    }

    function openMailClient() {
        if (!currentEmailBooking) return;

        const userEmail = currentEmailBooking.users?.email;
        if (!userEmail) {
            safeShowToast('Pa gen email pou kliyan sa a', 'error');
            return;
        }

        const template = emailTemplates[currentEmailType];
        const subject = encodeURIComponent(template.subject);
        const body = encodeURIComponent(getPlainTextEmail());

        window.location.href = `mailto:${userEmail}?subject=${subject}&body=${body}`;
    }

    function bindEmailModalEvents() {
        // Close button
        const closeBtn = document.getElementById('closeEmailModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeEmailModal);
        }

        // Email type buttons
        document.querySelectorAll('.email-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentEmailType = btn.dataset.type;
                updateEmailTypeButtons();
                updateEmailPreview();
            });
        });

        // Copy button
        const copyBtn = document.getElementById('copyEmailBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', copyEmailToClipboard);
        }

        // Open mail client button
        const mailBtn = document.getElementById('openMailClientBtn');
        if (mailBtn) {
            mailBtn.addEventListener('click', openMailClient);
        }

        // Close on overlay click
        const emailModal = document.getElementById('emailModal');
        if (emailModal) {
            emailModal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    closeEmailModal();
                }
            });
        }
    }

    // Make functions globally accessible
    window.updateBookingStatus = updateBookingStatus;
    window.closeBookingModal = closeBookingModal;
    window.openEmailModal = openEmailModal;
    window.closeEmailModal = closeEmailModal;

    function applyFilters() {
        const statusFilter = document.getElementById('statusFilter')?.value || 'all';
        const sortFilter = document.getElementById('sortFilter')?.value || 'newest';
        const searchTerm = document.getElementById('bookingSearch')?.value?.toLowerCase()?.trim() || '';

        filteredBookings = allBookings.filter(booking => {
            if (statusFilter !== 'all' && booking.status !== statusFilter) return false;

            if (searchTerm) {
                const userName = booking.users && booking.users.full_name ? booking.users.full_name.toLowerCase() : '';
                const userEmail = booking.users && booking.users.email ? booking.users.email.toLowerCase() : '';
                const packageName = (booking.package_name || '').toLowerCase();

                if (!userName.includes(searchTerm) && !userEmail.includes(searchTerm) && !packageName.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });

        if (sortFilter === 'newest') {
            filteredBookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sortFilter === 'oldest') {
            filteredBookings.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (sortFilter === 'date') {
            filteredBookings.sort((a, b) => {
                const dateA = a.preferred_date || '';
                const dateB = b.preferred_date || '';
                return dateA.localeCompare(dateB);
            });
        }

        renderBookings();
    }

    function bindFilters() {
        const statusFilter = document.getElementById('statusFilter');
        const sortFilter = document.getElementById('sortFilter');
        const searchInput = document.getElementById('bookingSearch');

        if (statusFilter) {
            statusFilter.addEventListener('change', applyFilters);
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
        await loadBookings();
        bindFilters();
        bindEmailModalEvents();
        
        // Bind modal close button
        const closeBtn = document.getElementById('closeBookingModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeBookingModal);
        }
        
        // Close modal when clicking overlay
        const modal = document.getElementById('bookingModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    closeBookingModal();
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        init().catch((err) => {
            console.error(err);
            safeShowToast('Failed to initialize bookings page', 'error');
        });
    });
})();
