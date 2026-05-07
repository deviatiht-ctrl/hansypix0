/**
 * ANIMATIONS CONTROLLER
 * Handles GSAP animations and scroll effects
 */

document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initParallaxEffects();
});

/**
 * Initialize scroll-triggered animations
 */
function initScrollAnimations() {
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded, animations disabled');
        return;
    }
    
    // Register ScrollTrigger plugin
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }
    
    // Animate service cards
    const servicesGrid = document.querySelector('.services-grid');
    if (servicesGrid) {
        gsap.from('.service-card', {
            scrollTrigger: {
                trigger: servicesGrid,
                start: 'top 90%',
                toggleActions: 'play none none none'
            },
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            clearProps: 'all'
        });
    }
    
    // Animate portfolio items
    gsap.utils.toArray('.portfolio-item').forEach((item, index) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            scale: 0.9,
            opacity: 0,
            duration: 0.6,
            delay: index * 0.05,
            ease: 'back.out(1.2)'
        });
    });
    
    // Animate testimonial cards
    gsap.utils.toArray('.testimonial-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            x: index % 2 === 0 ? -50 : 50,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out'
        });
    });
    
    // Animate section headers
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        });
    });
    
    // Animate stats
    gsap.utils.toArray('.stat-item').forEach((stat, index) => {
        gsap.from(stat, {
            scrollTrigger: {
                trigger: stat,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            scale: 0.5,
            opacity: 0,
            duration: 0.6,
            delay: index * 0.15,
            ease: 'back.out(1.5)'
        });
    });
}

/**
 * Initialize parallax effects
 */
function initParallaxEffects() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return;
    }
    
    // Parallax for hero content
    gsap.to('.hero-content', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        },
        y: 100,
        opacity: 0.5,
        ease: 'none'
    });
    
    // Parallax for specific background elements
    // We avoid .service-card and .testimonial-card to prevent conflicting animations
    gsap.utils.toArray('.about-image .glass-card, .cta-content').forEach(card => {
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            },
            y: -20,
            ease: 'none'
        });
    });
}

/**
 * Animate element on click
 */
function animateClick(element) {
    if (typeof gsap === 'undefined') return;
    
    gsap.to(element, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
    });
}

/**
 * Fade in element
 */
function fadeIn(element, duration = 0.5) {
    if (typeof gsap === 'undefined') {
        element.style.opacity = '1';
        return;
    }
    
    gsap.to(element, {
        opacity: 1,
        duration: duration,
        ease: 'power2.out'
    });
}

/**
 * Fade out element
 */
function fadeOut(element, duration = 0.5) {
    if (typeof gsap === 'undefined') {
        element.style.opacity = '0';
        return;
    }
    
    gsap.to(element, {
        opacity: 0,
        duration: duration,
        ease: 'power2.in'
    });
}

/**
 * Slide in from bottom
 */
function slideInUp(element, duration = 0.6) {
    if (typeof gsap === 'undefined') return;
    
    gsap.from(element, {
        y: 50,
        opacity: 0,
        duration: duration,
        ease: 'power3.out'
    });
}

/**
 * Export functions for use in other scripts
 */
if (typeof window !== 'undefined') {
    window.animateClick = animateClick;
    window.fadeIn = fadeIn;
    window.fadeOut = fadeOut;
    window.slideInUp = slideInUp;
}
