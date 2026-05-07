(() => {
    const TAX_RATE = 0.1; // 10% tax

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
        if (!Number.isFinite(n)) return currency === 'USD' ? '$0.00' : `0.00 ${currency}`;

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

    function getLocalPageUrl() {
        const page = window.location.pathname.split('/').pop() || 'checkout.html';
        return `${page}${window.location.search || ''}`;
    }

    function showStep(stepNumber) {
        const steps = Array.from(document.querySelectorAll('.checkout-steps .step'));
        const contents = Array.from(document.querySelectorAll('.checkout-step-content'));

        steps.forEach((step) => {
            const n = Number(step.dataset.step);
            if (n === stepNumber) step.classList.add('active');
            else step.classList.remove('active');
        });

        contents.forEach((c) => {
            if (c.id === `step${stepNumber}`) c.classList.add('active');
            else c.classList.remove('active');
        });
    }

    function getSelectedPaymentMethod() {
        const checked = document.querySelector('input[name="paymentMethod"]:checked');
        return checked ? checked.value : 'stripe';
    }

    function setPaymentMethod(method) {
        const stripeForm = document.getElementById('stripePaymentForm');
        const paypalForm = document.getElementById('paypalPaymentForm');
        const moncashForm = document.getElementById('moncashPaymentForm');

        if (stripeForm) stripeForm.style.display = method === 'stripe' ? 'block' : 'none';
        if (paypalForm) paypalForm.style.display = method === 'paypal' ? 'block' : 'none';
        if (moncashForm) moncashForm.style.display = method === 'moncash' ? 'block' : 'none';

        try {
            if (window.PAYMENT_HANDLERS && window.PAYMENT_HANDLERS[method] && typeof window.PAYMENT_HANDLERS[method].mount === 'function') {
                window.PAYMENT_HANDLERS[method].mount();
            }
        } catch (_) {
            // ignore
        }
    }

    function bindPaymentMethodCards() {
        const cards = Array.from(document.querySelectorAll('.payment-method-card'));
        cards.forEach((card) => {
            card.addEventListener('click', () => {
                const method = card.dataset.method;
                const radio = card.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change', { bubbles: true }));
                } else if (method) {
                    setPaymentMethod(method);
                }
            });
        });

        const radios = Array.from(document.querySelectorAll('input[name="paymentMethod"]'));
        radios.forEach((r) => {
            r.addEventListener('change', () => {
                setPaymentMethod(getSelectedPaymentMethod());
            });
        });
    }

    function readBookingDetails() {
        const preferredDate = document.getElementById('preferredDate')?.value || '';
        const preferredTime = document.getElementById('preferredTime')?.value || '';
        const location = document.getElementById('location')?.value || '';
        const specialRequests = document.getElementById('specialRequests')?.value?.trim() || null;

        return { preferredDate, preferredTime, location, specialRequests };
    }

    function validateBookingDetails(details) {
        if (!details.preferredDate) {
            safeShowToast('Please select a preferred date', 'warning');
            return false;
        }

        if (!details.preferredTime) {
            safeShowToast('Please select a preferred time', 'warning');
            return false;
        }

        if (!details.location) {
            safeShowToast('Please select a location', 'warning');
            return false;
        }

        return true;
    }

    function locationLabel(value) {
        if (value === 'studio') return 'Our Studio';
        if (value === 'outdoor') return 'Outdoor Location';
        if (value === 'client') return "Client's Location";
        return value || '-';
    }

    function paymentMethodLabel(value) {
        if (value === 'stripe') return 'Credit/Debit Card (Stripe)';
        if (value === 'paypal') return 'PayPal';
        if (value === 'moncash') return 'MonCash';
        return value || '-';
    }

    async function fetchSettingValue(key) {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) return null;

        try {
            const query = supabaseClient
                .from('settings')
                .select('setting_value')
                .eq('setting_key', key);

            const exec = typeof query.maybeSingle === 'function' ? query.maybeSingle() : query.single();
            const { data, error } = await exec;

            if (error) return null;
            if (!data) return null;

            const value = data.setting_value;
            if (typeof value === 'string') {
                try {
                    return JSON.parse(value);
                } catch (_) {
                    return value;
                }
            }

            return value;
        } catch (_) {
            return null;
        }
    }

    async function getPricingPackages() {
        const fallback = (typeof CONFIG !== 'undefined' && Array.isArray(CONFIG.PRICING_PACKAGES))
            ? CONFIG.PRICING_PACKAGES
            : [];

        const fromSettings = await fetchSettingValue('pricing_packages');
        if (Array.isArray(fromSettings)) return fromSettings;

        return fallback;
    }

    function pickPackage(packages, requestedId) {
        if (!Array.isArray(packages) || packages.length === 0) return null;

        if (requestedId) {
            const found = packages.find(p => String(p.id) === String(requestedId));
            if (found) return found;
        }

        const professional = packages.find(p => String(p.id) === 'professional');
        if (professional) return professional;

        const popular = packages.find(p => p && p.popular);
        if (popular) return popular;

        return packages[0];
    }

    function updateOrderSummary(pkg) {
        if (!pkg) return;

        setText('packageName', pkg.name || 'Package');
        setText('packageDuration', pkg.duration ? `${pkg.duration} session` : '');

        const features = Array.isArray(pkg.features) ? pkg.features : [];
        const featuresHtml = features.map(f => `
            <li>
                <i data-lucide="check"></i>
                <span>${String(f)}</span>
            </li>
        `).join('');
        setHtml('packageFeatures', featuresHtml);

        const currency = pkg.currency || 'USD';
        const price = Number(pkg.price);
        const base = Number.isFinite(price) ? price : 0;
        const tax = base * TAX_RATE;
        const total = base + tax;

        setText('packagePrice', formatMoney(base, currency));
        setText('taxAmount', formatMoney(tax, currency));
        setText('totalAmount', formatMoney(total, currency));

        if (typeof lucide !== 'undefined') {
            try {
                lucide.createIcons();
            } catch (_) {
                // ignore
            }
        }
    }

    function updateConfirmation(details, method) {
        setText('confirmDate', details.preferredDate || '-');
        setText('confirmTime', details.preferredTime || '-');
        setText('confirmLocation', locationLabel(details.location));
        setText('confirmPaymentMethod', paymentMethodLabel(method));
    }

    async function ensureUserProfileRow(user) {
        if (!user || typeof supabaseClient === 'undefined' || !supabaseClient) return;

        const fullName = user.user_metadata && (user.user_metadata.full_name || user.user_metadata.fullName) ? (user.user_metadata.full_name || user.user_metadata.fullName) : null;
        const phone = user.user_metadata && user.user_metadata.phone ? user.user_metadata.phone : null;

        try {
            await supabaseClient
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: fullName,
                    phone: phone,
                    role: 'customer'
                }, { onConflict: 'id' });
        } catch (err) {
            console.error('Error ensuring user profile row:', err);
        }
    }

    function openSuccessModal(reference) {
        const modal = document.getElementById('successModal');
        if (!modal) return;

        setText('bookingReference', reference || '-');
        modal.style.display = 'flex';

        const overlay = modal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                modal.style.display = 'none';
            }, { once: true });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') modal.style.display = 'none';
        }, { once: true });
    }

    async function processCheckout(currentUser, pkg) {
        if (!pkg) throw new Error('Missing package');

        const method = getSelectedPaymentMethod();
        const details = readBookingDetails();

        if (!validateBookingDetails(details)) return;

        const agree = document.getElementById('agreeTerms');
        if (agree && !agree.checked) {
            safeShowToast('Please agree to the terms to continue', 'warning');
            return;
        }

        await ensureUserProfileRow(currentUser);

        const currency = pkg.currency || 'USD';
        const price = Number(pkg.price);
        const base = Number.isFinite(price) ? price : 0;
        const tax = base * TAX_RATE;
        const total = base + tax;

        const { data: booking, error: bookingError } = await supabaseClient
            .from('bookings')
            .insert({
                user_id: currentUser.id,
                package_id: pkg.id || 'package',
                package_name: pkg.name || 'Package',
                package_price: base,
                preferred_date: details.preferredDate,
                preferred_time: details.preferredTime,
                location: details.location,
                special_requests: details.specialRequests,
                status: 'pending'
            })
            .select('id')
            .single();

        if (bookingError) throw bookingError;

        let paymentResult = {
            status: 'pending',
            transactionId: `demo_${method}_${Date.now()}`,
            details: {}
        };

        try {
            const handler = window.PAYMENT_HANDLERS && window.PAYMENT_HANDLERS[method];
            if (handler && typeof handler.process === 'function') {
                const r = await handler.process({
                    amount: total,
                    currency,
                    bookingId: booking.id,
                    package: pkg
                });
                if (r && typeof r === 'object') paymentResult = { ...paymentResult, ...r };
            }
        } catch (_) {
            // ignore
        }

        const paymentStatus = paymentResult.status === 'completed' ? 'completed' : 'pending';

        const { error: paymentError } = await supabaseClient
            .from('payments')
            .insert({
                booking_id: booking.id,
                user_id: currentUser.id,
                amount: total,
                currency,
                payment_method: method,
                payment_status: paymentStatus,
                transaction_id: paymentResult.transactionId,
                payment_details: paymentResult.details || {}
            });

        if (paymentError) throw paymentError;

        openSuccessModal(String(booking.id).slice(0, 8).toUpperCase());

        safeShowToast('Booking created successfully', 'success');
    }

    function bindStepButtons(currentUserRef, pkgRef) {
        const nextToPayment = document.getElementById('nextToPayment');
        const backToDetails = document.getElementById('backToDetails');
        const proceedToConfirm = document.getElementById('proceedToConfirm');
        const backToPayment = document.getElementById('backToPayment');
        const confirmBooking = document.getElementById('confirmBooking');

        if (nextToPayment) {
            nextToPayment.addEventListener('click', () => {
                const details = readBookingDetails();
                if (!validateBookingDetails(details)) return;
                showStep(2);
            });
        }

        if (backToDetails) {
            backToDetails.addEventListener('click', () => {
                showStep(1);
            });
        }

        if (proceedToConfirm) {
            proceedToConfirm.addEventListener('click', () => {
                const details = readBookingDetails();
                if (!validateBookingDetails(details)) return;

                const method = getSelectedPaymentMethod();
                updateConfirmation(details, method);

                showStep(3);
            });
        }

        if (backToPayment) {
            backToPayment.addEventListener('click', () => {
                showStep(2);
            });
        }

        if (confirmBooking) {
            confirmBooking.addEventListener('click', async () => {
                if (!currentUserRef.user) {
                    safeShowToast('Please log in to continue', 'warning');
                    window.location.href = `/src/pages/login.html?redirect=${encodeURIComponent(getLocalPageUrl())}`;
                    return;
                }

                try {
                    confirmBooking.disabled = true;
                    await processCheckout(currentUserRef.user, pkgRef.pkg);
                } catch (err) {
                    console.error(err);
                    safeShowToast('Checkout failed. Please try again.', 'error');
                } finally {
                    confirmBooking.disabled = false;
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
        const preferredDate = document.getElementById('preferredDate');
        if (preferredDate) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            preferredDate.min = `${yyyy}-${mm}-${dd}`;
        }

        try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            const currentUserRef = { user: user || null };

            if (!currentUserRef.user) {
                window.location.href = `/src/pages/login.html?redirect=${encodeURIComponent(getLocalPageUrl())}`;
                return;
            }

            const packages = await getPricingPackages();
            const params = new URLSearchParams(window.location.search);
            const requestedPackageId = params.get('package');
            const pkg = pickPackage(packages, requestedPackageId);
            const pkgRef = { pkg };

            updateOrderSummary(pkg);

            bindPaymentMethodCards();
            setPaymentMethod(getSelectedPaymentMethod());

            bindStepButtons(currentUserRef, pkgRef);

            showStep(1);
        } catch (err) {
            console.error(err);
            safeShowToast('Failed to initialize checkout', 'error');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        init();
    });
})();
