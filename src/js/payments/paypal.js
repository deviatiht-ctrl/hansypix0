(() => {
    const state = {
        mounted: false
    };

    function setPlaceholder(container, message) {
        if (!container) return;
        container.innerHTML = `<div style="padding:0.75rem 1rem; color: rgba(255,255,255,0.75);">${message}</div>`;
    }

    function mount() {
        const container = document.getElementById('paypal-button-container');
        if (!container) return;

        if (state.mounted) return;
        state.mounted = true;

        const paypal = window.paypal;
        if (!paypal || typeof paypal.Buttons !== 'function') {
            setPlaceholder(container, 'PayPal is in demo mode. Add a valid PayPal client-id to enable real payments.');
            return;
        }

        try {
            paypal.Buttons({
                style: { layout: 'vertical' },
                createOrder: (_data, actions) => {
                    return actions.order.create({
                        purchase_units: [{ amount: { value: '1.00' } }]
                    });
                },
                onApprove: async (_data, actions) => {
                    try {
                        await actions.order.capture();
                    } catch (_) {
                        // ignore
                    }
                }
            }).render(container);
        } catch (_) {
            setPlaceholder(container, 'PayPal failed to initialize. Running in demo mode.');
        }
    }

    async function process(ctx) {
        if (!state.mounted) mount();

        return {
            status: 'completed',
            transactionId: `paypal_demo_${Date.now()}`,
            details: {
                demo: true,
                amount: ctx && ctx.amount,
                currency: ctx && ctx.currency
            }
        };
    }

    window.PAYMENT_HANDLERS = window.PAYMENT_HANDLERS || {};
    window.PAYMENT_HANDLERS.paypal = { mount, process };
})();
