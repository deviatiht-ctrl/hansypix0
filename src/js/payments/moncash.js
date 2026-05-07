(() => {
    const state = {
        mounted: false
    };

    function setPlaceholder(container, message) {
        if (!container) return;
        container.innerHTML = `<div style="padding:0.75rem 1rem; color: rgba(255,255,255,0.75);">${message}</div>`;
    }

    function mount() {
        const container = document.getElementById('moncashPaymentForm');
        if (!container) return;

        if (state.mounted) return;
        state.mounted = true;

        setPlaceholder(container, 'MonCash is in demo mode. A real integration will be added later.');
    }

    async function process(ctx) {
        if (!state.mounted) mount();

        const phone = document.getElementById('moncashPhone')?.value?.trim() || null;

        return {
            status: 'completed',
            transactionId: `moncash_demo_${Date.now()}`,
            details: {
                demo: true,
                phone,
                amount: ctx && ctx.amount,
                currency: ctx && ctx.currency
            }
        };
    }

    window.PAYMENT_HANDLERS = window.PAYMENT_HANDLERS || {};
    window.PAYMENT_HANDLERS.moncash = { mount, process };
})();
