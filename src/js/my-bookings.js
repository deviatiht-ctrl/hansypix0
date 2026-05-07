let currentPage = 1;
let totalPages = 1;
let currentStatus = 'all';
const itemsPerPage = 6;

async function loadBookings(page = 1, status = 'all') {
    const bookingsList = document.getElementById('bookingsList');
    
    if (!bookingsList) return;
    
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        bookingsList.innerHTML = '<div class="error-state"><p>Unable to connect to database</p></div>';
        return;
    }
    
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = '/src/pages/login.html';
        return;
    }
    
    try {
        bookingsList.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading bookings...</p></div>';
        
        let query = supabaseClient
            .from('bookings')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (status !== 'all') {
            query = query.eq('status', status);
        }
        
        const offset = (page - 1) * itemsPerPage;
        query = query.range(offset, offset + itemsPerPage - 1);
        
        const { data: bookings, error, count } = await query;
        
        if (error) throw error;
        
        totalPages = Math.ceil(count / itemsPerPage);
        currentPage = page;
        currentStatus = status;
        
        updatePagination();
        
        if (!bookings || bookings.length === 0) {
            bookingsList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="calendar-off"></i>
                    <h3>No bookings found</h3>
                    <p>${status === 'all' ? 'You haven\'t made any bookings yet.' : `No ${status} bookings found.`}</p>
                    <a href="pricing.html" class="btn-primary">
                        <i data-lucide="calendar-plus"></i>
                        Book a Session
                    </a>
                </div>
            `;
            lucide.createIcons();
            return;
        }
        
        bookingsList.innerHTML = bookings.map(booking => createBookingCard(booking)).join('');
        
        document.querySelectorAll('.booking-card').forEach(card => {
            card.addEventListener('click', () => {
                const bookingId = card.dataset.bookingId;
                showBookingDetails(bookingId);
            });
        });
        
        lucide.createIcons();
        
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsList.innerHTML = `
            <div class="error-state">
                <i data-lucide="alert-circle"></i>
                <h3>Error loading bookings</h3>
                <p>${error.message}</p>
                <button class="btn-primary" onclick="loadBookings(${page}, '${status}')">
                    <i data-lucide="refresh-cw"></i>
                    Try Again
                </button>
            </div>
        `;
        lucide.createIcons();
    }
}

function createBookingCard(booking) {
    const statusColors = {
        pending: 'status-pending',
        confirmed: 'status-confirmed',
        completed: 'status-completed',
        cancelled: 'status-cancelled'
    };
    
    const statusIcons = {
        pending: 'clock',
        confirmed: 'check-circle',
        completed: 'check',
        cancelled: 'x-circle'
    };
    
    const date = new Date(booking.session_date);
    const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const formattedTime = booking.session_time || 'Time TBD';
    
    return `
        <div class="booking-card ${statusColors[booking.status]}" data-booking-id="${booking.id}">
            <div class="booking-header">
                <div class="booking-service">
                    <i data-lucide="camera"></i>
                    <h3>${booking.service_type || 'Photography Session'}</h3>
                </div>
                <span class="booking-status ${statusColors[booking.status]}">
                    <i data-lucide="${statusIcons[booking.status]}"></i>
                    ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
            </div>
            
            <div class="booking-details">
                <div class="booking-detail-item">
                    <i data-lucide="calendar"></i>
                    <span>${formattedDate}</span>
                </div>
                <div class="booking-detail-item">
                    <i data-lucide="clock"></i>
                    <span>${formattedTime}</span>
                </div>
                <div class="booking-detail-item">
                    <i data-lucide="map-pin"></i>
                    <span>${booking.location || 'Location TBD'}</span>
                </div>
                ${booking.package_name ? `
                <div class="booking-detail-item">
                    <i data-lucide="package"></i>
                    <span>${booking.package_name}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="booking-footer">
                <div class="booking-price">
                    <span class="price-label">Total:</span>
                    <span class="price-amount">$${(parseFloat(booking.package_price || 0) * 1.1).toFixed(2)}</span>
                </div>
                <button class="btn-secondary btn-small">
                    View Details
                    <i data-lucide="arrow-right"></i>
                </button>
            </div>
        </div>
    `;
}

async function showBookingDetails(bookingId) {
    const modal = document.getElementById('bookingModal');
    const detailsContainer = document.getElementById('bookingDetails');
    
    if (!modal || !detailsContainer) return;
    
    try {
        const { data: booking, error } = await supabaseClient
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();
        
        if (error) throw error;
        
        const date = new Date(booking.session_date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const statusColors = {
            pending: 'status-pending',
            confirmed: 'status-confirmed',
            completed: 'status-completed',
            cancelled: 'status-cancelled'
        };
        
        detailsContainer.innerHTML = `
            <div class="booking-detail-header">
                <h2>${booking.service_type || 'Photography Session'}</h2>
                <span class="booking-status ${statusColors[booking.status]}">
                    ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
            </div>
            
            <div class="booking-detail-section">
                <h3><i data-lucide="calendar"></i> Session Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">${formattedDate}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Time:</span>
                        <span class="detail-value">${booking.session_time || 'TBD'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Location:</span>
                        <span class="detail-value">${booking.location || 'TBD'}</span>
                    </div>
                    ${booking.package_name ? `
                    <div class="detail-item">
                        <span class="detail-label">Package:</span>
                        <span class="detail-value">${booking.package_name}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            ${booking.notes ? `
            <div class="booking-detail-section">
                <h3><i data-lucide="file-text"></i> Notes</h3>
                <p class="booking-notes">${booking.notes}</p>
            </div>
            ` : ''}
            
            <div class="booking-detail-section">
                <h3><i data-lucide="credit-card"></i> Payment Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Package Price:</span>
                        <span class="detail-value">$${parseFloat(booking.package_price || 0).toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Tax (10%):</span>
                        <span class="detail-value">$${(parseFloat(booking.package_price || 0) * 0.1).toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Total Amount:</span>
                        <span class="detail-value price">$${(parseFloat(booking.package_price || 0) * 1.1).toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Payment Status:</span>
                        <span class="detail-value">${booking.payment_status || 'Pending'}</span>
                    </div>
                </div>
            </div>
            
            <div class="booking-detail-actions">
                ${booking.status === 'pending' || booking.status === 'confirmed' ? `
                    <button class="btn-danger" onclick="cancelBooking('${booking.id}')">
                        <i data-lucide="x-circle"></i>
                        Cancel Booking
                    </button>
                ` : ''}
                <button class="btn-secondary" onclick="closeBookingModal()">
                    Close
                </button>
            </div>
        `;
        
        modal.style.display = 'flex';
        lucide.createIcons();
        
    } catch (error) {
        console.error('Error loading booking details:', error);
        alert('Failed to load booking details');
    }
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId);
        
        if (error) throw error;
        
        alert('Booking cancelled successfully');
        closeBookingModal();
        loadBookings(currentPage, currentStatus);
        
    } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking: ' + error.message);
    }
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    
    if (!pagination) return;
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

async function getCurrentUser() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadBookings(1, 'all');
    
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const status = btn.dataset.status;
            loadBookings(1, status);
        });
    });
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                loadBookings(currentPage - 1, currentStatus);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                loadBookings(currentPage + 1, currentStatus);
            }
        });
    }
    
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeBookingModal);
    }
    
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                closeBookingModal();
            }
        });
    }
});
