/**
 * Interactive.js - Handles all interactive UI elements
 * This script manages card flipping, horizontal scrolling, 
 * and other interactive UI components.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Interactive Card Flipping
    initializeCards();

    // Horizontal Scrolling
    initializeHorizontalScroll();

    // Scene Controls
    initializeSceneControls();
});

function initializeCards() {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        // Flip card on click
        card.addEventListener('click', function() {
            this.classList.add('flipped');
        });

        // Handle close button
        const closeBtn = card.querySelector('.card-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent the card click event
                card.classList.remove('flipped');
            });
        }

        // Add hover effects
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('flipped')) {
                this.style.transform = 'translateY(-10px)';
                this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.4)';
            }
        });

        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('flipped')) {
                this.style.transform = '';
                this.style.boxShadow = '';
            }
        });
    });
}

function initializeHorizontalScroll() {
    const scrollContainer = document.querySelector('.horizontal-scroll-container');

    if (!scrollContainer) return;

    // Enable mouse drag scrolling
    let isDown = false;
    let startX;
    let scrollLeft;

    scrollContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        scrollContainer.style.cursor = 'grabbing';
        startX = e.pageX - scrollContainer.offsetLeft;
        scrollLeft = scrollContainer.scrollLeft;

        // Prevent text selection during drag
        e.preventDefault();
    });

    scrollContainer.addEventListener('mouseleave', () => {
        isDown = false;
        scrollContainer.style.cursor = 'grab';
    });

    scrollContainer.addEventListener('mouseup', () => {
        isDown = false;
        scrollContainer.style.cursor = 'grab';
    });

    scrollContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scrollContainer.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        scrollContainer.scrollLeft = scrollLeft - walk;
    });

    // Set initial cursor style
    scrollContainer.style.cursor = 'grab';

    // Auto scroll animation
    let scrollDirection = 1; // 1 for right, -1 for left
    const scrollSpeed = 0.5; // pixels per frame
    let scrollInterval;

    function startAutoScroll() {
        scrollInterval = setInterval(() => {
            scrollContainer.scrollLeft += scrollDirection * scrollSpeed;

            // Change direction when reaching the end
            if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
                scrollDirection = -1;
            } else if (scrollContainer.scrollLeft <= 0) {
                scrollDirection = 1;
            }
        }, 16); // roughly 60fps
    }

    function stopAutoScroll() {
        clearInterval(scrollInterval);
    }

    // Start auto-scroll when the element enters the viewport
    const scrollSection = document.querySelector('.scroll-section');

    if (scrollSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startAutoScroll();
                } else {
                    stopAutoScroll();
                }
            });
        }, { threshold: 0.2 });

        observer.observe(scrollSection);
    }

    // Stop auto-scroll when user interacts with the container
    scrollContainer.addEventListener('mouseenter', stopAutoScroll);
    scrollContainer.addEventListener('mouseleave', startAutoScroll);
    scrollContainer.addEventListener('touchstart', stopAutoScroll);
    scrollContainer.addEventListener('touchend', startAutoScroll);
}

function initializeSceneControls() {
    const controls = document.querySelectorAll('.scene-control');

    controls.forEach(control => {
        control.addEventListener('click', function() {
            // Remove active class from all controls
            controls.forEach(c => c.classList.remove('active'));

            // Add active class to clicked control
            this.classList.add('active');

            // Get the view to display
            const view = this.getAttribute('data-view');

            // Update the scene (will be handled by 3d-scene.js)
            window.updateScene && window.updateScene(view);

            // Update the info section
            updateSceneInfo(view);
        });
    });

    // Set initial active state
    if (controls.length) {
        controls[0].classList.add('active');
        const initialView = controls[0].getAttribute('data-view');
        updateSceneInfo(initialView);
    }
}

function updateSceneInfo(view) {
    const infoItems = document.querySelectorAll('.scene-info-item');

    infoItems.forEach(item => {
        item.classList.remove('active');

        if (item.getAttribute('data-info') === view) {
            item.classList.add('active');
        }
    });
}

// Add interactive scroll animations with GSAP if available
function initializeScrollAnimations() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        // Animate section titles
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.from(title, {
                scrollTrigger: {
                    trigger: title,
                    scroller: '.parallax-container',
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 50,
                duration: 1
            });
        });

        // Animate cards
        gsap.utils.toArray('.card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    scroller: '.parallax-container',
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 50,
                duration: 0.8,
                delay: i * 0.2
            });
        });

        // Animate CTA section
        const ctaSection = document.querySelector('.cta-section');
        if (ctaSection) {
            gsap.from('.cta-title', {
                scrollTrigger: {
                    trigger: ctaSection,
                    scroller: '.parallax-container',
                    start: 'top 60%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 30,
                duration: 1
            });

            gsap.from('.cta-text', {
                scrollTrigger: {
                    trigger: ctaSection,
                    scroller: '.parallax-container',
                    start: 'top 60%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 20,
                duration: 1,
                delay: 0.2
            });

            gsap.from('.cta-buttons', {
                scrollTrigger: {
                    trigger: ctaSection,
                    scroller: '.parallax-container',
                    start: 'top 60%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 20,
                duration: 1,
                delay: 0.4
            });
        }
    }
}

// Initialize GSAP animations if available
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // Wait for images to load for proper positioning
    window.addEventListener('load', () => {
        const container = document.querySelector('.parallax-container');
        if (!container) return;

        // Register ScrollTrigger with the custom scroller - with fixed implementation
        ScrollTrigger.defaults({ scroller: container });
        ScrollTrigger.scrollerProxy(container, {
            scrollTop(value) {
                if (arguments.length) {
                    container.scrollTop = value;
                }
                return container.scrollTop;
            },
            getBoundingClientRect() {
                return container.getBoundingClientRect();
            }
        });

        // Initialize scroll animations with a slight delay to avoid recursion
        setTimeout(() => {
            initializeScrollAnimations();
        }, 100);

        // Update ScrollTrigger when the window resizes - using debounced refresh
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                ScrollTrigger.refresh();
            }, 250);
        });
    });
}