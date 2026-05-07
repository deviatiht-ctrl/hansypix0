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

    function setTextIfPresent(id, text) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = text == null ? '' : String(text);
    }

    function setHrefIfPresent(id, href) {
        const el = document.getElementById(id);
        if (!el || !href) return;
        el.setAttribute('href', href);
    }

    function setMailtoIfPresent(id, email) {
        const el = document.getElementById(id);
        if (!el || !email) return;
        el.textContent = String(email);
        el.setAttribute('href', `mailto:${email}`);
    }

    function setTelIfPresent(id, phone) {
        const el = document.getElementById(id);
        if (!el || !phone) return;
        el.textContent = String(phone);
        const tel = String(phone).replace(/[^+\d]/g, '');
        if (tel) el.setAttribute('href', `tel:${tel}`);
    }

    function hydrateContactAndSocial() {
        if (typeof CONFIG === 'undefined' || !CONFIG.CONTACT) return;

        setMailtoIfPresent('contactEmail', CONFIG.CONTACT.email);
        setTelIfPresent('contactPhone', CONFIG.CONTACT.phone);

        setTextIfPresent('footerEmail', CONFIG.CONTACT.email);
        setTextIfPresent('footerPhone', CONFIG.CONTACT.phone);

        const social = CONFIG.CONTACT.socialMedia || {};
        setHrefIfPresent('socialInstagram', social.instagram);
        setHrefIfPresent('socialFacebook', social.facebook);
        setHrefIfPresent('socialTwitter', social.twitter);
        setHrefIfPresent('socialYoutube', social.youtube);

        setHrefIfPresent('socialInstagramLarge', social.instagram);
        setHrefIfPresent('socialFacebookLarge', social.facebook);
        setHrefIfPresent('socialTwitterLarge', social.twitter);
        setHrefIfPresent('socialYoutubeLarge', social.youtube);
    }

    function openModal(modal) {
        if (!modal) return;
        modal.style.display = 'flex';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.style.display = 'none';
    }

    function bindSuccessModal() {
        const modal = document.getElementById('successModal');
        const closeBtn = document.getElementById('closeModalBtn');
        const overlay = modal ? modal.querySelector('.modal-overlay') : null;

        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal));
        }

        if (overlay) {
            overlay.addEventListener('click', () => closeModal(modal));
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal(modal);
        });

        return modal;
    }

    async function submitToSupabase(payload) {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            throw new Error('Supabase client not initialized');
        }

        const { error } = await supabaseClient
            .from('contact_submissions')
            .insert(payload);

        if (error) throw error;
    }

    function bindContactForm(modal) {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                }

                const name = document.getElementById('name')?.value?.trim() || '';
                const email = document.getElementById('email')?.value?.trim() || '';
                const phone = document.getElementById('phone')?.value?.trim() || null;
                const subject = document.getElementById('subject')?.value?.trim() || null;
                const message = document.getElementById('message')?.value?.trim() || '';

                if (!name || !email || !message) {
                    safeShowToast('Please fill in all required fields', 'warning');
                    return;
                }

                await submitToSupabase({
                    name,
                    email,
                    phone,
                    subject,
                    message
                });

                form.reset();
                openModal(modal);
                safeShowToast('Message sent successfully', 'success');
            } catch (err) {
                console.error(err);
                safeShowToast('Failed to send message. Please try again.', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            runInit();
        } else {
            window.addEventListener('supabaseReady', () => {
                runInit();
            }, { once: true });
        }
    });

    function runInit() {
        hydrateContactAndSocial();
        const modal = bindSuccessModal();
        bindContactForm(modal);
    }
})();
