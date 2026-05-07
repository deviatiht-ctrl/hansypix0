(() => {
    let currentPackages = [];

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

    function setValue(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = value == null ? '' : String(value);
    }

    function getValue(id) {
        const el = document.getElementById(id);
        return el ? el.value : '';
    }

    function openModal(modal) {
        if (!modal) return;
        modal.style.display = 'flex';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.style.display = 'none';
    }

    async function fetchSetting(key) {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) return null;

        try {
            const query = supabaseClient
                .from('settings')
                .select('setting_value')
                .eq('setting_key', key);

            const exec = typeof query.maybeSingle === 'function' ? query.maybeSingle() : query.single();
            const { data, error } = await exec;

            if (error || !data) return null;

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

    async function upsertSetting(key, value) {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            throw new Error('Supabase client not initialized');
        }

        const { error } = await supabaseClient
            .from('settings')
            .upsert({
                setting_key: key,
                setting_value: typeof value === 'string' ? value : JSON.stringify(value)
            }, { onConflict: 'setting_key' });

        if (error) throw error;
    }

    async function loadHomepageSettings() {
        const heroTitle = await fetchSetting('hero_title');
        const heroSubtitle = await fetchSetting('hero_subtitle');
        const aboutText = await fetchSetting('about_text');

        if (heroTitle) setValue('heroTitle', heroTitle);
        if (heroSubtitle) setValue('heroSubtitle', heroSubtitle);
        if (aboutText) setValue('aboutText', aboutText);
    }

    async function loadContactSettings() {
        const email = await fetchSetting('contact_email');
        const phone = await fetchSetting('contact_phone');
        const address = await fetchSetting('contact_address');

        if (email) setValue('contactEmail', email);
        if (phone) setValue('contactPhone', phone);
        if (address) setValue('contactAddress', address);
    }

    async function loadSocialSettings() {
        const instagram = await fetchSetting('social_instagram');
        const facebook = await fetchSetting('social_facebook');
        const twitter = await fetchSetting('social_twitter');
        const youtube = await fetchSetting('social_youtube');

        if (instagram) setValue('socialInstagram', instagram);
        if (facebook) setValue('socialFacebook', facebook);
        if (twitter) setValue('socialTwitter', twitter);
        if (youtube) setValue('socialYoutube', youtube);
    }

    async function loadPricingSettings() {
        const packages = await fetchSetting('pricing_packages');

        if (Array.isArray(packages)) {
            currentPackages = packages;
        } else if (typeof CONFIG !== 'undefined' && Array.isArray(CONFIG.PRICING_PACKAGES)) {
            currentPackages = CONFIG.PRICING_PACKAGES;
        } else {
            currentPackages = [];
        }

        renderPricingPackages();
    }

    function renderPricingPackages() {
        const container = document.getElementById('pricingPackages');
        if (!container) return;

        container.innerHTML = '';

        if (currentPackages.length === 0) {
            container.innerHTML = '<p class="empty-message">No pricing packages configured</p>';
            return;
        }

        currentPackages.forEach((pkg, index) => {
            const card = document.createElement('div');
            card.className = 'pricing-package-card glass-card';

            card.innerHTML = `
                <div class="package-header">
                    <h4>${pkg.name || 'Package'}</h4>
                    ${pkg.popular ? '<span class="badge badge-primary">Popular</span>' : ''}
                </div>
                <div class="package-details">
                    <p class="package-price">$${pkg.price || 0}</p>
                    <p class="package-duration">${pkg.duration || ''}</p>
                    <ul class="package-features">
                        ${(pkg.features || []).map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>
                <div class="package-actions">
                    <button class="btn-secondary btn-small edit-package-btn" data-index="${index}">
                        <i data-lucide="edit"></i>
                        Edit
                    </button>
                </div>
            `;

            const editBtn = card.querySelector('.edit-package-btn');
            if (editBtn) {
                editBtn.addEventListener('click', () => openEditPackageModal(index));
            }

            container.appendChild(card);
        });

        if (typeof lucide !== 'undefined') {
            try {
                lucide.createIcons();
            } catch (_) {
                // ignore
            }
        }
    }

    function openEditPackageModal(index) {
        const modal = document.getElementById('editPackageModal');
        if (!modal) return;

        const pkg = currentPackages[index];
        if (!pkg) return;

        setValue('packageId', index);
        setValue('packageName', pkg.name || '');
        setValue('packagePrice', pkg.price || 0);
        setValue('packageDuration', pkg.duration || '');

        const featuresContainer = document.getElementById('packageFeatures');
        if (featuresContainer) {
            featuresContainer.innerHTML = '';
            (pkg.features || []).forEach(feature => {
                addFeatureInput(featuresContainer, feature);
            });
        }

        const popularCheckbox = document.getElementById('packagePopular');
        if (popularCheckbox) {
            popularCheckbox.checked = Boolean(pkg.popular);
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

    function addFeatureInput(container, value = '') {
        const wrapper = document.createElement('div');
        wrapper.className = 'feature-input-wrapper';
        wrapper.style.display = 'flex';
        wrapper.style.gap = '0.5rem';
        wrapper.style.marginBottom = '0.5rem';

        wrapper.innerHTML = `
            <input type="text" class="feature-input" value="${value}" placeholder="Feature description">
            <button type="button" class="btn-danger btn-small remove-feature-btn">
                <i data-lucide="x"></i>
            </button>
        `;

        const removeBtn = wrapper.querySelector('.remove-feature-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => wrapper.remove());
        }

        container.appendChild(wrapper);

        if (typeof lucide !== 'undefined') {
            try {
                lucide.createIcons();
            } catch (_) {
                // ignore
            }
        }
    }

    async function savePackageEdit(e) {
        e.preventDefault();

        const index = parseInt(getValue('packageId'), 10);
        if (!Number.isFinite(index) || index < 0 || index >= currentPackages.length) {
            safeShowToast('Invalid package index', 'error');
            return;
        }

        const name = getValue('packageName').trim();
        const price = parseFloat(getValue('packagePrice'));
        const duration = getValue('packageDuration').trim();
        const popular = document.getElementById('packagePopular')?.checked || false;

        const featureInputs = Array.from(document.querySelectorAll('.feature-input'));
        const features = featureInputs.map(input => input.value.trim()).filter(f => f);

        if (!name) {
            safeShowToast('Package name is required', 'warning');
            return;
        }

        if (!Number.isFinite(price) || price < 0) {
            safeShowToast('Valid price is required', 'warning');
            return;
        }

        currentPackages[index] = {
            ...currentPackages[index],
            name,
            price,
            duration,
            features,
            popular
        };

        try {
            await upsertSetting('pricing_packages', currentPackages);
            safeShowToast('Package updated successfully', 'success');
            renderPricingPackages();
            closeModal(document.getElementById('editPackageModal'));
        } catch (err) {
            console.error(err);
            safeShowToast('Failed to save package', 'error');
        }
    }

    function bindTabs() {
        const tabs = Array.from(document.querySelectorAll('.tab-btn'));
        const panels = Array.from(document.querySelectorAll('.settings-panel'));

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;

                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                panels.forEach(panel => {
                    if (panel.id === `${targetTab}-panel`) {
                        panel.classList.add('active');
                    } else {
                        panel.classList.remove('active');
                    }
                });
            });
        });
    }

    function bindForms() {
        const heroForm = document.getElementById('heroSettingsForm');
        if (heroForm) {
            heroForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    await upsertSetting('hero_title', getValue('heroTitle'));
                    await upsertSetting('hero_subtitle', getValue('heroSubtitle'));
                    safeShowToast('Hero settings saved', 'success');
                } catch (err) {
                    console.error(err);
                    safeShowToast('Failed to save hero settings', 'error');
                }
            });
        }

        const aboutForm = document.getElementById('aboutSettingsForm');
        if (aboutForm) {
            aboutForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    await upsertSetting('about_text', getValue('aboutText'));
                    safeShowToast('About settings saved', 'success');
                } catch (err) {
                    console.error(err);
                    safeShowToast('Failed to save about settings', 'error');
                }
            });
        }

        const contactForm = document.getElementById('contactSettingsForm');
        if (contactForm) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    await upsertSetting('contact_email', getValue('contactEmail'));
                    await upsertSetting('contact_phone', getValue('contactPhone'));
                    await upsertSetting('contact_address', getValue('contactAddress'));
                    safeShowToast('Contact settings saved', 'success');
                } catch (err) {
                    console.error(err);
                    safeShowToast('Failed to save contact settings', 'error');
                }
            });
        }

        const socialForm = document.getElementById('socialSettingsForm');
        if (socialForm) {
            socialForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    await upsertSetting('social_instagram', getValue('socialInstagram'));
                    await upsertSetting('social_facebook', getValue('socialFacebook'));
                    await upsertSetting('social_twitter', getValue('socialTwitter'));
                    await upsertSetting('social_youtube', getValue('socialYoutube'));
                    safeShowToast('Social settings saved', 'success');
                } catch (err) {
                    console.error(err);
                    safeShowToast('Failed to save social settings', 'error');
                }
            });
        }

        const editPackageForm = document.getElementById('editPackageForm');
        if (editPackageForm) {
            editPackageForm.addEventListener('submit', savePackageEdit);
        }

        const addFeatureBtn = document.getElementById('addFeatureBtn');
        if (addFeatureBtn) {
            addFeatureBtn.addEventListener('click', () => {
                const container = document.getElementById('packageFeatures');
                if (container) addFeatureInput(container);
            });
        }

        const saveAllBtn = document.getElementById('saveAllSettings');
        if (saveAllBtn) {
            saveAllBtn.addEventListener('click', async () => {
                try {
                    await upsertSetting('hero_title', getValue('heroTitle'));
                    await upsertSetting('hero_subtitle', getValue('heroSubtitle'));
                    await upsertSetting('about_text', getValue('aboutText'));
                    await upsertSetting('contact_email', getValue('contactEmail'));
                    await upsertSetting('contact_phone', getValue('contactPhone'));
                    await upsertSetting('contact_address', getValue('contactAddress'));
                    await upsertSetting('social_instagram', getValue('socialInstagram'));
                    await upsertSetting('social_facebook', getValue('socialFacebook'));
                    await upsertSetting('social_twitter', getValue('socialTwitter'));
                    await upsertSetting('social_youtube', getValue('socialYoutube'));
                    safeShowToast('All settings saved successfully', 'success');
                } catch (err) {
                    console.error(err);
                    safeShowToast('Failed to save all settings', 'error');
                }
            });
        }
    }

    function bindModals() {
        const modal = document.getElementById('editPackageModal');
        const closeBtn = document.getElementById('closePackageModal');
        const cancelBtn = document.getElementById('cancelPackageEdit');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal));
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => closeModal(modal));
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
        await Promise.all([
            loadHomepageSettings(),
            loadContactSettings(),
            loadSocialSettings(),
            loadPricingSettings()
        ]);

        bindTabs();
        bindForms();
        bindModals();
    }

    document.addEventListener('DOMContentLoaded', () => {
        init().catch((err) => {
            console.error(err);
            safeShowToast('Failed to initialize settings page', 'error');
        });
    });
})();
