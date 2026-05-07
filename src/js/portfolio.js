document.addEventListener('DOMContentLoaded', () => {
    const portfolioGrid = document.getElementById('portfolioGrid');
    const portfolioLoading = document.getElementById('portfolioLoading');
    const portfolioEmpty = document.getElementById('portfolioEmpty');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    const lightbox = document.getElementById('lightbox');
    const lightboxOverlay = document.getElementById('lightboxOverlay');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxMedia = document.getElementById('lightboxMedia');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDescription = document.getElementById('lightboxDescription');
    const lightboxTags = document.getElementById('lightboxTags');

    if (!portfolioGrid || !portfolioLoading || !portfolioEmpty) {
        return;
    }

    const pageSize = (typeof CONFIG !== 'undefined' && CONFIG.PAGINATION && CONFIG.PAGINATION.portfolioItemsPerPage)
        ? CONFIG.PAGINATION.portfolioItemsPerPage
        : 12;

    const state = {
        category: 'all',
        page: 0,
        items: [],
        currentIndex: -1,
        isLoading: false,
        hasMore: false
    };

    const params = new URLSearchParams(window.location.search);
    const initialCategory = params.get('category');
    if (initialCategory) {
        state.category = initialCategory;
    }

    function setLoading(isLoading) {
        if (portfolioLoading) {
            portfolioLoading.style.display = isLoading ? 'flex' : 'none';
        }
    }

    function setEmpty(isEmpty, message) {
        if (!portfolioEmpty) return;

        if (typeof message === 'string' && message.trim().length > 0) {
            const p = portfolioEmpty.querySelector('p');
            if (p) p.textContent = message;
        }

        portfolioEmpty.style.display = isEmpty ? 'flex' : 'none';
    }

    function setLoadMoreVisible(visible) {
        if (!loadMoreContainer) return;
        loadMoreContainer.style.display = visible ? 'block' : 'none';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    function svgFallbackDataUrl(title, subtitle) {
        const safeTitle = (title || 'HANSYPIX').toString().slice(0, 30);
        const safeSub = (subtitle || '').toString().slice(0, 40);
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a0a0a"/>
      <stop offset="0.55" stop-color="#1a1a1a"/>
      <stop offset="1" stop-color="#0a0a0a"/>
    </linearGradient>
    <radialGradient id="r" cx="50%" cy="40%" r="60%">
      <stop offset="0" stop-color="rgba(201,169,97,0.25)"/>
      <stop offset="1" stop-color="rgba(201,169,97,0)"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#g)"/>
  <rect width="1200" height="900" fill="url(#r)"/>
  <g fill="none" stroke="rgba(255,255,255,0.08)">
    <path d="M0,650 C250,540 420,760 650,650 C860,550 980,590 1200,500" stroke-width="2"/>
    <path d="M0,720 C240,610 420,830 650,720 C860,620 990,650 1200,560" stroke-width="2"/>
  </g>
  <g font-family="Inter, Arial" fill="#ffffff">
    <text x="70" y="110" font-size="42" font-weight="700" fill="#c9a961">HANSYPIX</text>
    <text x="70" y="170" font-size="44" font-weight="700">${escapeHtml(safeTitle)}</text>
    <text x="70" y="225" font-size="22" fill="rgba(255,255,255,0.75)">${escapeHtml(safeSub)}</text>
  </g>
</svg>`;
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    }

    function resolveMediaUrl(item, urlValue) {
        if (!urlValue) return '';
        const raw = String(urlValue);

        if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
            return raw;
        }

        if (typeof supabaseClient !== 'undefined' && supabaseClient && supabaseClient.storage && typeof STORAGE_BUCKETS !== 'undefined' && STORAGE_BUCKETS.PORTFOLIO) {
            const { data } = supabaseClient.storage.from(STORAGE_BUCKETS.PORTFOLIO).getPublicUrl(raw);
            if (data && data.publicUrl) return data.publicUrl;
        }

        return raw;
    }

    function createPortfolioItemElement(item, index) {
        const div = document.createElement('div');
        div.className = 'portfolio-item';
        div.dataset.index = String(index);

        const title = item.title || 'Untitled';
        const category = item.category || '';
        const mediaType = item.media_type || 'image';

        const mediaUrl = resolveMediaUrl(item, item.thumbnail_url || item.media_url);
        const fullMediaUrl = resolveMediaUrl(item, item.media_url);

        let mediaHtml = '';

        if (mediaType === 'video') {
            mediaHtml = `
                <video class="portfolio-item-image" muted playsinline preload="metadata">
                    <source src="${escapeHtml(fullMediaUrl)}" type="video/mp4" />
                </video>
            `;
        } else {
            mediaHtml = `
                <img class="portfolio-item-image" src="${escapeHtml(mediaUrl)}" alt="${escapeHtml(title)}" loading="lazy" />
            `;
        }

        div.innerHTML = `
            ${mediaHtml}
            <div class="portfolio-item-overlay">
                <h3 class="portfolio-item-title">${escapeHtml(title)}</h3>
                <div class="portfolio-item-meta">
                    <span class="portfolio-item-category">${escapeHtml(category)}</span>
                    ${mediaType === 'video' ? `<span class="portfolio-item-badge"><i data-lucide="play"></i> Video</span>` : ''}
                </div>
            </div>
        `;

        const img = div.querySelector('img');
        if (img) {
            img.addEventListener('error', () => {
                img.src = svgFallbackDataUrl(title, category);
            }, { once: true });
        }

        const video = div.querySelector('video');
        if (video) {
            video.addEventListener('error', () => {
                div.innerHTML = `
                    <img class="portfolio-item-image" src="${svgFallbackDataUrl(title, 'Video')}" alt="${escapeHtml(title)}" loading="lazy" />
                    <div class="portfolio-item-overlay">
                        <h3 class="portfolio-item-title">${escapeHtml(title)}</h3>
                        <div class="portfolio-item-meta">
                            <span class="portfolio-item-category">${escapeHtml(category)}</span>
                            <span class="portfolio-item-badge"><i data-lucide="play"></i> Video</span>
                        </div>
                    </div>
                `;
                if (window.lucide) lucide.createIcons();
            }, { once: true });

            div.addEventListener('mouseenter', () => {
                video.play().catch(() => {});
            });
            div.addEventListener('mouseleave', () => {
                try {
                    video.pause();
                    video.currentTime = 0;
                } catch (_) {
                    // ignore
                }
            });
        }

        div.addEventListener('click', () => openLightbox(index));

        return div;
    }

    function renderItems(reset) {
        if (reset) {
            portfolioGrid.innerHTML = '';
        }

        const startIndex = reset ? 0 : (portfolioGrid.children ? portfolioGrid.children.length : 0);

        state.items.forEach((item, i) => {
            const existing = portfolioGrid.querySelector(`[data-index="${i}"]`);
            if (existing) return;

            const el = createPortfolioItemElement(item, i);
            portfolioGrid.appendChild(el);
        });

        if (window.lucide) {
            lucide.createIcons();
        }

        if (window.gsap) {
            const newEls = Array.from(portfolioGrid.children).slice(startIndex);
            if (newEls.length > 0) {
                gsap.from(newEls, {
                    y: 30,
                    opacity: 0,
                    duration: 0.6,
                    stagger: 0.05,
                    ease: 'power3.out'
                });
            }
        }
    }

    async function fetchPortfolio(reset = false) {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            setLoading(false);
            setEmpty(true, 'Supabase client not initialized. Please refresh the page.');
            setLoadMoreVisible(false);
            return;
        }

        if (state.isLoading) return;
        state.isLoading = true;

        if (reset) {
            state.page = 0;
            state.items = [];
        }

        setEmpty(false);
        setLoadMoreVisible(false);
        setLoading(true);

        const from = state.page * pageSize;
        const to = from + pageSize - 1;

        try {
            let query = supabaseClient
                .from('portfolio')
                .select('*')
                .order('display_order', { ascending: true })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (state.category && state.category !== 'all') {
                query = query.eq('category', state.category);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Portfolio query error:', error);
                if (window.showToast) {
                    showToast(error.message || 'Failed to load portfolio', 'error');
                }
                setEmpty(true, `Error: ${error.message}`);
                setLoading(false);
                return;
            }

            const rows = Array.isArray(data) ? data : [];

            if (reset) {
                state.items = rows;
            } else {
                state.items = state.items.concat(rows);
            }

            renderItems(reset);

            setLoading(false);

            if (state.items.length === 0) {
                setEmpty(true, 'No portfolio items yet. Run seed.sql or add items from Admin Panel.');
            }

            state.hasMore = rows.length === pageSize;
            setLoadMoreVisible(state.hasMore);

        } catch (e) {
            console.error('Portfolio fetch exception:', e);
            if (window.showToast) {
                showToast(e.message || 'Failed to load portfolio', 'error');
            }
            setEmpty(true, `Error: ${e.message}`);
            setLoading(false);
        } finally {
            state.isLoading = false;
        }
    }

    function setActiveFilter(category) {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            const btnCat = btn.getAttribute('data-category');
            if (btnCat === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function openLightbox(index) {
        if (!lightbox || !lightboxMedia || !lightboxTitle || !lightboxDescription || !lightboxTags) return;

        const item = state.items[index];
        if (!item) return;

        state.currentIndex = index;

        const title = item.title || 'Untitled';
        const description = item.description || '';
        const category = item.category || '';
        const mediaType = item.media_type || 'image';

        const url = resolveMediaUrl(item, item.media_url);

        lightboxMedia.innerHTML = '';

        if (mediaType === 'video') {
            const video = document.createElement('video');
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.innerHTML = `<source src="${escapeHtml(url)}" type="video/mp4" />`;
            lightboxMedia.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = url;
            img.alt = title;
            img.addEventListener('error', () => {
                img.src = svgFallbackDataUrl(title, category);
            }, { once: true });
            lightboxMedia.appendChild(img);
        }

        lightboxTitle.textContent = title;
        lightboxDescription.textContent = description;

        lightboxTags.innerHTML = '';
        if (Array.isArray(item.tags)) {
            item.tags.slice(0, 10).forEach(tag => {
                const t = document.createElement('span');
                t.className = 'lightbox-tag';
                t.textContent = String(tag);
                lightboxTags.appendChild(t);
            });
        }

        lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden';

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
        state.currentIndex = -1;

        if (lightboxMedia) {
            lightboxMedia.innerHTML = '';
        }
    }

    function prevLightbox() {
        if (state.items.length === 0) return;
        const nextIndex = (state.currentIndex - 1 + state.items.length) % state.items.length;
        openLightbox(nextIndex);
    }

    function nextLightbox() {
        if (state.items.length === 0) return;
        const nextIndex = (state.currentIndex + 1) % state.items.length;
        openLightbox(nextIndex);
    }

    function bindEvents() {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', async () => {
                const category = btn.getAttribute('data-category') || 'all';
                if (category === state.category) return;

                state.category = category;
                setActiveFilter(category);

                await fetchPortfolio(true);
            });
        });

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', async () => {
                if (state.isLoading) return;
                state.page += 1;
                await fetchPortfolio(false);
            });
        }

        if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);
        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxPrev) lightboxPrev.addEventListener('click', prevLightbox);
        if (lightboxNext) lightboxNext.addEventListener('click', nextLightbox);

        document.addEventListener('keydown', (e) => {
            if (!lightbox || lightbox.style.display !== 'block') return;

            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevLightbox();
            if (e.key === 'ArrowRight') nextLightbox();
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
        setActiveFilter(state.category);
        bindEvents();
        await fetchPortfolio(true);

        const itemId = params.get('item');
        if (itemId) {
            const idx = state.items.findIndex(i => String(i.id) === String(itemId));
            if (idx >= 0) openLightbox(idx);
        }
    }

    init();
});
