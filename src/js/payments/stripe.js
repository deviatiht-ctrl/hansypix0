(() => {
    const state = {
        mounted: false,
        stripe: null,
        elements: null,
        card: null
    };

    function getPublishableKey() {
        if (typeof CONFIG !== 'undefined') {
            const key = CONFIG.STRIPE_PUBLISHABLE_KEY ||
                (CONFIG.PAYMENT_PROVIDERS && CONFIG.PAYMENT_PROVIDERS.stripe && CONFIG.PAYMENT_PROVIDERS.stripe.publishableKey);
            if (typeof key === 'string' && key.trim()) return key.trim();
        }

        if (typeof window.STRIPE_PUBLISHABLE_KEY === 'string' && window.STRIPE_PUBLISHABLE_KEY.trim()) {
            return window.STRIPE_PUBLISHABLE_KEY.trim();
        }

        return null;
    }

    function setPlaceholder(container, message) {
        if (!container) return;
        container.innerHTML = `<div style="padding:0.75rem 1rem; color: rgba(255,255,255,0.75);">${message}</div>`;
    }

    function mount() {
        const container = document.getElementById('card-element');
        if (!container) return;

        if (state.mounted) return;
        state.mounted = true;

        const key = getPublishableKey();
        const StripeFn = typeof window !== 'undefined' ? window.Stripe : null;

        if (!StripeFn || !key) {
            setPlaceholder(container, 'Stripe is in demo mode. Add a Stripe publishable key to enable real payments.');
            return;
        }

        try {
            state.stripe = StripeFn(key);
            state.elements = state.stripe.elements();
            state.card = state.elements.create('card', {
                style: {
                    base: {
                        color: '#ffffff',
                        fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
                        fontSize: '16px',
                        '::placeholder': { color: 'rgba(255,255,255,0.6)' }
                    },
                    invalid: { color: '#ef4444' }
                }
            });

            state.card.mount(container);

            const errors = document.getElementById('card-errors');
            if (errors) {
                state.card.on('change', (event) => {
                    errors.textContent = event && event.error && event.error.message ? event.error.message : '';
                });
            }
        } catch (_) {
            setPlaceholder(container, 'Stripe failed to initialize. Running in demo mode.');
        }
    }

    async function process(ctx) {
        if (!state.mounted) mount();

        const key = getPublishableKey();
        if (!key || !state.stripe || !state.card) {
            return {
                status: 'completed',
                transactionId: `stripe_demo_${Date.now()}`,
                details: {
                    demo: true,
                    amount: ctx && ctx.amount,
                    currency: ctx && ctx.currency
                }
            };
        }

        try {
            // Create payment intent via Supabase Edge Function
            const supabaseUrl = typeof supabaseClient !== 'undefined' && supabaseClient 
                ? supabaseClient.supabaseUrl 
                : (typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : null);
            
            if (!supabaseUrl) {
                throw new Error('Supabase URL not configured');
            }

            const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${typeof supabaseClient !== 'undefined' && supabaseClient ? supabaseClient.supabaseKey : SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    amount: ctx.amount,
                    currency: ctx.currency || 'usd',
                    bookingId: ctx.bookingId,
                    metadata: {
                        packageId: ctx.package?.id,
                        packageName: ctx.package?.name
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create payment intent');
            }

            const { clientSecret, paymentIntentId } = await response.json();

            // Confirm payment with card element
            const { error: confirmError, paymentIntent } = await state.stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: state.card
                    }
                }
            );

            if (confirmError) {
                throw new Error(confirmError.message);
            }

            if (paymentIntent.status === 'succeeded') {
                return {
                    status: 'completed',
                    transactionId: paymentIntent.id,
                    details: {
                        amount: paymentIntent.amount / 100,
                        currency: paymentIntent.currency,
                        status: paymentIntent.status
                    }
                };
            } else {
                return {
                    status: 'pending',
                    transactionId: paymentIntent.id,
                    details: {
                        status: paymentIntent.status
                    }
                };
            }
        } catch (error) {
            console.error('Stripe payment error:', error);
            throw error;
        }
    }

    window.PAYMENT_HANDLERS = window.PAYMENT_HANDLERS || {};
    window.PAYMENT_HANDLERS.stripe = { mount, process };
})();
