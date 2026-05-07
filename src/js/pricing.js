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

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function setHrefIfPresent(id, href) {
        const el = document.getElementById(id);
        if (!el || !href) return;
        el.setAttribute('href', href);
    }

    function setTextIfPresent(id, text) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = text == null ? '' : String(text);
    }

    function hydrateContactAndSocial() {
        if (typeof CONFIG === 'undefined') return;

        if (CONFIG.CONTACT) {
            setTextIfPresent('footerEmail', CONFIG.CONTACT.email);
            setTextIfPresent('footerPhone', CONFIG.CONTACT.phone);
        }

        const social = CONFIG.CONTACT && CONFIG.CONTACT.socialMedia ? CONFIG.CONTACT.socialMedia : null;
        if (!social) return;

        setHrefIfPresent('socialInstagram', social.instagram);
        setHrefIfPresent('socialFacebook', social.facebook);
        setHrefIfPresent('socialTwitter', social.twitter);
        setHrefIfPresent('socialYoutube', social.youtube);

        setHrefIfPresent('socialInstagramLarge', social.instagram);
        setHrefIfPresent('socialFacebookLarge', social.facebook);
        setHrefIfPresent('socialTwitterLarge', social.twitter);
        setHrefIfPresent('socialYoutubeLarge', social.youtube);
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

    function formatPrice(pkg) {
        const raw = Number(pkg && pkg.price);
        const currency = pkg && pkg.currency ? String(pkg.currency) : 'USD';

        if (!Number.isFinite(raw)) return currency === 'USD' ? '$0' : `0 ${currency}`;

        if (currency === 'USD') {
            return `$${raw.toFixed(0)}`;
        }

        return `${raw.toFixed(0)} ${currency}`;
    }

    function createCard(pkg) {
        const card = document.createElement('div');
        const popular = Boolean(pkg && pkg.popular);

        card.className = `pricing-card glass-card${popular ? ' popular' : ''}`;

        const features = Array.isArray(pkg && pkg.features) ? pkg.features : [];

        const badge = popular ? '<div class="pricing-badge">Most Popular</div>' : '';

        card.innerHTML = `
            ${badge}
            <div class="pricing-header">
                <h3 class="pricing-name">${escapeHtml(pkg && pkg.name ? pkg.name : 'Package')}</h3>
                <p class="pricing-duration">${escapeHtml(pkg && pkg.duration ? pkg.duration : '')}</p>
            </div>
            <div class="pricing-price">
                <div class="price-amount">${escapeHtml(formatPrice(pkg))}</div>
            </div>
            <ul class="pricing-features">
                ${features.map(f => `
                    <li class="pricing-feature">
                        <i data-lucide="check"></i>
                        <span>${escapeHtml(f)}</span>
                    </li>
                `).join('')}
            </ul>
            <a class="btn-primary btn-large btn-full" href="checkout.html?package=${encodeURIComponent(pkg && pkg.id ? pkg.id : '')}">
                <i data-lucide="calendar"></i>
                Book This Package
            </a>
        `;

        return card;
    }

    async function initPricing() {
        const grid = document.getElementById('pricingGrid');
        if (!grid) return;

        grid.innerHTML = '';

        const packages = await getPricingPackages();

        if (!packages || packages.length === 0) {
            grid.innerHTML = '<p class="empty-message">No packages available.</p>';
            return;
        }

        packages.forEach(pkg => {
            grid.appendChild(createCard(pkg));
        });

        if (typeof lucide !== 'undefined') {
            try {
                lucide.createIcons();
            } catch (_) {
                // ignore
            }
        }
    }

    function initFaqAccordion() {
        const items = Array.from(document.querySelectorAll('.faq-item'));
        if (items.length === 0) return;

        items.forEach(item => {
            const btn = item.querySelector('.faq-question');
            if (!btn) return;

            btn.addEventListener('click', () => {
                items.forEach(other => {
                    if (other !== item) other.classList.remove('active');
                });
                item.classList.toggle('active');

                if (typeof lucide !== 'undefined') {
                    try {
                        lucide.createIcons();
                    } catch (_) {
                        // ignore
                    }
                }
            });
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
        hydrateContactAndSocial();
        initPricing().catch((err) => {
            console.error(err);
            safeShowToast('Failed to load pricing packages', 'error');
        });
        initFaqAccordion();
    }

    document.addEventListener('DOMContentLoaded', () => {
        init();
    });
})();
