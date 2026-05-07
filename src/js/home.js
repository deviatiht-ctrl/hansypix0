/**
 * HOME PAGE FUNCTIONALITY
 * Handles homepage interactions and dynamic content
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Home.js: DOMContentLoaded');
    
    // Try to initialize immediately if supabase is ready
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        console.log('Home.js: Supabase already available');
        initApp();
    } else {
        console.log('Home.js: Waiting for supabaseReady event...');
        
        // Listen for supabaseReady event
        window.addEventListener('supabaseReady', () => {
            console.log('Home.js: supabaseReady event received');
            initApp();
        }, { once: true });
        
        // Fallback: Try again after a short delay in case event was missed
        setTimeout(() => {
            if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                console.log('Home.js: Supabase found after timeout');
                initApp();
            } else {
                console.error('Home.js: Supabase still not available after timeout');
                // Show error in showcase
                const showcaseMain = document.getElementById('showcaseMain');
                if (showcaseMain) {
                    showcaseMain.innerHTML = `
                        <div class="showcase-empty">
                            <i data-lucide="wifi-off"></i>
                            <h4>Connection Error</h4>
                            <p>Please refresh the page</p>
                        </div>
                    `;
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
            }
        }, 3000);
    }
});

async function initApp() {
    try {
        initHeroVideoPlayback();
        initHeroAnimations();
        await loadFeaturedPortfolio();
        await loadTestimonials();
        await loadSiteSettings();
        
        // Refresh ScrollTrigger after dynamic content is loaded
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    } catch (error) {
        console.error('Error during app initialization:', error);
    }
}

function initHeroVideoPlayback() {
    const heroVideo = document.getElementById('heroVideo');
    if (!heroVideo) return;

    const tryPlay = () => {
        heroVideo.play().catch(() => {});
    };

    // Try immediately, and again when metadata is ready.
    tryPlay();
    heroVideo.addEventListener('loadedmetadata', tryPlay, { once: true });

    // iOS/Android sometimes require a user gesture before autoplay succeeds.
    const unlockPlayback = () => {
        tryPlay();
        document.removeEventListener('touchstart', unlockPlayback);
        document.removeEventListener('click', unlockPlayback);
    };

    document.addEventListener('touchstart', unlockPlayback, { passive: true });
    document.addEventListener('click', unlockPlayback);

    // Resume video when user returns to tab/app.
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            tryPlay();
        }
    });
}

/**
 * Initialize hero section animations
 */
function initHeroAnimations() {
    // GSAP animations for hero content
    if (typeof gsap !== 'undefined') {
        gsap.from('.hero-title', {
            duration: 1,
            y: 50,
            opacity: 0,
            ease: 'power3.out'
        });
        
        gsap.from('.hero-subtitle', {
            duration: 1,
            y: 30,
            opacity: 0,
            delay: 0.2,
            ease: 'power3.out'
        });
        
        gsap.from('.hero-cta', {
            duration: 1,
            y: 30,
            opacity: 0,
            delay: 0.4,
            ease: 'power3.out'
        });
    }
}

/**
 * Portfolio Showcase State
 */
let showcaseState = {
    items: [],
    currentIndex: 0,
    autoplayInterval: null,
    autoplayDuration: 5000,
    progressInterval: null,
    isPaused: false
};

/**
 * Load featured portfolio items into showcase
 */
async function loadFeaturedPortfolio() {
    const showcaseMain = document.getElementById('showcaseMain');
    const thumbnailsContainer = document.getElementById('showcaseThumbnails');
    
    // Also check for old featuredGrid element for backward compatibility
    const featuredGrid = document.getElementById('featuredGrid');
    
    if (!showcaseMain && !featuredGrid) {
        console.log('No showcase or grid element found');
        return;
    }
    
    const targetElement = showcaseMain || featuredGrid;
    
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        console.error('Supabase client not initialized');
        targetElement.innerHTML = `
            <div class="showcase-empty">
                <i data-lucide="wifi-off"></i>
                <h4>Connection Error</h4>
                <p>Unable to connect to database</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    
    try {
        console.log('Loading portfolio items...');
        
        // First try featured items, then fall back to all portfolio items
        let { data: items, error } = await supabaseClient
            .from('portfolio')
            .select('*')
            .eq('is_featured', true)
            .order('display_order', { ascending: true })
            .limit(8);
        
        if (error) {
            console.error('Error fetching featured items:', error);
            throw error;
        }
        
        console.log('Featured items:', items?.length || 0);
        
        // If no featured items, get recent portfolio items
        if (!items || items.length === 0) {
            console.log('No featured items, fetching all...');
            const { data: allItems, error: allError } = await supabaseClient
                .from('portfolio')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(8);
            
            if (allError) {
                console.error('Error fetching all items:', allError);
                throw allError;
            }
            items = allItems;
            console.log('All items:', items?.length || 0);
        }
        
        if (!items || items.length === 0) {
            console.log('No items found in portfolio');
            targetElement.innerHTML = `
                <div class="showcase-empty">
                    <i data-lucide="image-off"></i>
                    <h4>No portfolio items yet</h4>
                    <p>Check back soon for amazing work!</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }
        
        console.log('Building showcase with', items.length, 'items');
        showcaseState.items = items;
        
        // Build showcase HTML
        targetElement.innerHTML = '';
        items.forEach((item, index) => {
            const showcaseItem = createShowcaseItem(item, index);
            targetElement.appendChild(showcaseItem);
        });
        
        // Build thumbnails
        if (thumbnailsContainer) {
            thumbnailsContainer.innerHTML = '';
            items.forEach((item, index) => {
                const thumb = createThumbnail(item, index);
                thumbnailsContainer.appendChild(thumb);
            });
        }
        
        // Initialize showcase
        initShowcase();
        
        // Refresh icons
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        console.log('Showcase initialized successfully');
        
    } catch (error) {
        console.error('Error loading featured portfolio:', error);
        targetElement.innerHTML = `
            <div class="showcase-empty">
                <i data-lucide="alert-circle"></i>
                <h4>Unable to load portfolio</h4>
                <p>${error.message || 'Please try again later'}</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

/**
 * Resolve media URL - handles Supabase storage URLs
 */
function resolveMediaUrl(item, urlValue) {
    if (!urlValue) return '';
    const raw = String(urlValue);

    // Already a full URL or absolute path
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
        return raw;
    }

    // Try to get public URL from Supabase storage
    if (typeof supabaseClient !== 'undefined' && supabaseClient && supabaseClient.storage && typeof STORAGE_BUCKETS !== 'undefined' && STORAGE_BUCKETS.PORTFOLIO) {
        const { data } = supabaseClient.storage.from(STORAGE_BUCKETS.PORTFOLIO).getPublicUrl(raw);
        if (data && data.publicUrl) return data.publicUrl;
    }

    return raw;
}

/**
 * Create showcase item element
 */
function createShowcaseItem(item, index) {
    const div = document.createElement('div');
    div.className = `showcase-item ${index === 0 ? 'active' : ''}`;
    div.dataset.index = index;
    
    // Resolve media URL properly
    const mediaUrl = resolveMediaUrl(item, item.thumbnail_url || item.media_url);
    const fullMediaUrl = resolveMediaUrl(item, item.media_url);
    
    console.log('Creating showcase item:', item.title, 'URL:', mediaUrl);
    
    const mediaEl = item.media_type === 'video' 
        ? `<video src="${fullMediaUrl}" muted loop playsinline></video>`
        : `<img src="${mediaUrl}" alt="${item.title || ''}" loading="${index === 0 ? 'eager' : 'lazy'}">`;
    
    const categoryLabel = item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Photography';
    
    div.innerHTML = `
        ${mediaEl}
        <div class="showcase-overlay">
            <span class="showcase-category">${categoryLabel}</span>
            <h3 class="showcase-title">${item.title || 'Untitled'}</h3>
            ${item.description ? `<p class="showcase-description">${item.description}</p>` : ''}
        </div>
    `;
    
    // Handle image load error
    const img = div.querySelector('img');
    if (img) {
        img.addEventListener('error', () => {
            console.error('Image failed to load:', mediaUrl);
            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%231a1a1a" width="800" height="600"/%3E%3Ctext x="400" y="300" fill="%23666" text-anchor="middle" font-family="Arial" font-size="24"%3EImage unavailable%3C/text%3E%3C/svg%3E';
        }, { once: true });
    }
    
    div.addEventListener('click', () => {
        window.location.href = `/src/pages/portfolio.html?item=${item.id}`;
    });
    
    return div;
}

/**
 * Create thumbnail element
 */
function createThumbnail(item, index) {
    const div = document.createElement('div');
    div.className = `thumbnail-item ${index === 0 ? 'active' : ''}`;
    div.dataset.index = index;
    
    // Resolve media URL properly
    const thumbUrl = resolveMediaUrl(item, item.thumbnail_url || item.media_url);
    
    div.innerHTML = `<img src="${thumbUrl}" alt="${item.title || ''}" loading="lazy">`;
    
    div.addEventListener('click', () => {
        goToSlide(index);
        resetAutoplay();
    });
    
    return div;
}

/**
 * Initialize showcase functionality
 */
function initShowcase() {
    const prevBtn = document.getElementById('showcasePrev');
    const nextBtn = document.getElementById('showcaseNext');
    const showcaseMain = document.getElementById('showcaseMain');
    
    // Navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoplay();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoplay();
        });
    }
    
    // Pause on hover
    if (showcaseMain) {
        showcaseMain.addEventListener('mouseenter', () => {
            showcaseState.isPaused = true;
        });
        
        showcaseMain.addEventListener('mouseleave', () => {
            showcaseState.isPaused = false;
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const showcase = document.getElementById('featuredPortfolio');
        if (!showcase) return;
        
        const rect = showcase.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible) {
            if (e.key === 'ArrowLeft') {
                prevSlide();
                resetAutoplay();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                resetAutoplay();
            }
        }
    });
    
    // Start autoplay
    startAutoplay();
    
    // Animate first item
    animateCurrentSlide();
}

/**
 * Go to specific slide
 */
function goToSlide(index) {
    if (index < 0) index = showcaseState.items.length - 1;
    if (index >= showcaseState.items.length) index = 0;
    
    const items = document.querySelectorAll('.showcase-item');
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    
    // Update items
    items.forEach((item, i) => {
        item.classList.remove('active', 'prev', 'next');
        if (i === index) {
            item.classList.add('active');
        } else if (i < index) {
            item.classList.add('prev');
        } else {
            item.classList.add('next');
        }
    });
    
    // Update thumbnails
    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
    
    showcaseState.currentIndex = index;
    
    // Animate current slide
    animateCurrentSlide();
    
    // Play video if current item is video
    const currentItem = items[index];
    if (currentItem) {
        const video = currentItem.querySelector('video');
        if (video) {
            video.currentTime = 0;
            video.play().catch(() => {});
        }
    }
    
    // Pause other videos
    items.forEach((item, i) => {
        if (i !== index) {
            const video = item.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        }
    });
}

/**
 * Animate current slide with GSAP
 */
function animateCurrentSlide() {
    if (typeof gsap === 'undefined') return;
    
    const currentItem = document.querySelector('.showcase-item.active');
    if (!currentItem) return;
    
    const overlay = currentItem.querySelector('.showcase-overlay');
    const category = currentItem.querySelector('.showcase-category');
    const title = currentItem.querySelector('.showcase-title');
    const desc = currentItem.querySelector('.showcase-description');
    
    // Reset and animate
    gsap.fromTo(overlay, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.2 }
    );
    
    if (category) {
        gsap.fromTo(category,
            { x: -20, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out', delay: 0.3 }
        );
    }
    
    if (title) {
        gsap.fromTo(title,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.4 }
        );
    }
    
    if (desc) {
        gsap.fromTo(desc,
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', delay: 0.5 }
        );
    }
}

/**
 * Go to next slide
 */
function nextSlide() {
    goToSlide(showcaseState.currentIndex + 1);
}

/**
 * Go to previous slide
 */
function prevSlide() {
    goToSlide(showcaseState.currentIndex - 1);
}

/**
 * Start autoplay
 */
function startAutoplay() {
    const progressBar = document.getElementById('showcaseProgress');
    let progress = 0;
    
    // Clear existing intervals
    if (showcaseState.autoplayInterval) clearInterval(showcaseState.autoplayInterval);
    if (showcaseState.progressInterval) clearInterval(showcaseState.progressInterval);
    
    // Progress bar animation
    showcaseState.progressInterval = setInterval(() => {
        if (!showcaseState.isPaused) {
            progress += 100 / (showcaseState.autoplayDuration / 50);
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
        }
    }, 50);
    
    // Auto advance
    showcaseState.autoplayInterval = setInterval(() => {
        if (!showcaseState.isPaused) {
            nextSlide();
            progress = 0;
            if (progressBar) progressBar.style.width = '0%';
        }
    }, showcaseState.autoplayDuration);
}

/**
 * Reset autoplay timer
 */
function resetAutoplay() {
    const progressBar = document.getElementById('showcaseProgress');
    if (progressBar) progressBar.style.width = '0%';
    startAutoplay();
}

/**
 * Load testimonials from settings
 */
async function loadTestimonials() {
    const testimonialsGrid = document.getElementById('testimonialsGrid');
    
    if (!testimonialsGrid) return;
    
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        return;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('settings')
            .select('setting_value')
            .eq('setting_key', 'testimonials')
            .maybeSingle();
        
        if (error) throw error;
        
        const testimonials = data?.setting_value || [];
        
        testimonialsGrid.innerHTML = '';
        
        if (testimonials.length === 0) {
            testimonialsGrid.innerHTML = `
                <div class="glass-card testimonial-card">
                    <p class="testimonial-text">"HANSYPIX captured our wedding beautifully! The photos are absolutely stunning."</p>
                    <p class="testimonial-author">Emily Davis</p>
                    <div class="testimonial-rating">
                        <i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i>
                    </div>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }
        
        testimonials.forEach((testimonial, index) => {
            const card = document.createElement('div');
            card.className = 'glass-card testimonial-card';
            
            const stars = Array(testimonial.rating).fill('<i data-lucide="star"></i>').join('');
            
            card.innerHTML = `
                <p class="testimonial-text">"${testimonial.text}"</p>
                <p class="testimonial-author">${testimonial.name}</p>
                <div class="testimonial-rating">${stars}</div>
            `;
            
            testimonialsGrid.appendChild(card);
        });
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

/**
 * Load site settings
 */
async function loadSiteSettings() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        return;
    }
    try {
        const { data: settings, error } = await supabaseClient
            .from('settings')
            .select('*');
        
        if (error) throw error;
        
        settings.forEach(setting => {
            const value = typeof setting.setting_value === 'string' 
                ? JSON.parse(setting.setting_value)
                : setting.setting_value;
            
            const element = document.getElementById(setting.setting_key.replace(/_/g, ''));
            if (element) {
                element.textContent = value;
            }
        });
        
    } catch (error) {
        console.error('Error loading site settings:', error);
    }
}

