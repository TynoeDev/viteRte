/**
 * Parallax.js - Handles all parallax scrolling effects
 * This script manages the parallax scrolling effects, layer movement based on scroll position,
 * and the loading animation sequence.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initial loading sequence
    const loadingScreen = document.querySelector('.loading-screen');

    // Hide the loading screen immediately when page is ready
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    // Mouse movement parallax effect
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;

            parallaxLayers.forEach(layer => {
                const speed = parseFloat(layer.getAttribute('data-speed')) || 0;
                const offsetX = (0.5 - mouseX) * speed * 50;
                const offsetY = (0.5 - mouseY) * speed * 50;

                layer.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
            });
        });
    }

    // Get all parallax layers
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const parallaxContainer = document.querySelector('.parallax-container');

    // Apply parallax effect on scroll
    window.addEventListener('scroll', () => {
        const scrollTop = parallaxContainer.scrollTop;

        parallaxLayers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed')) || 0;
            const yPos = -(scrollTop * speed);
            layer.style.transform = `translateY(${yPos}px)`;
        });
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            parallaxContainer.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            if (menuToggle && menuToggle.classList.contains('active')) {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
            }
        });
    });

    // Dynamic header transparency based on scroll position
    function updateHeaderOpacity() {
        const header = document.querySelector('.main-header');
        const scrollTop = parallaxContainer.scrollTop;
        const maxScroll = 200;

        let opacity = scrollTop / maxScroll;
        opacity = Math.min(opacity, 0.9);

        header.style.background = `rgba(26, 30, 44, ${opacity + 0.1})`;
    }

    parallaxContainer.addEventListener('scroll', updateHeaderOpacity);
    updateHeaderOpacity();

    // Animation for elements when they come into view
    const observerOptions = {
        root: parallaxContainer,
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            } else {
                // Optionally remove the class when out of view
                // entry.target.classList.remove('in-view');
            }
        });
    }, observerOptions); // Observe all animatable elements
    document.querySelectorAll('.section-title, .section-line, .card, .scroll-content, .scene-container, .cta-title, .cta-text, .cta-buttons').forEach(el => {
        observer.observe(el);
    });

    // Enhanced mouse parallax for hero section
    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const { offsetX, offsetY, target } = e;
            const { clientWidth, clientHeight } = target;

            // Calculate mouse position as a percentage
            const xPos = offsetX / clientWidth - 0.5;
            const yPos = offsetY / clientHeight - 0.5;

            // Move background layer with parallax effect (translate only, no scale)
            const bgLayer = document.querySelector('.layer-bg');
            if (bgLayer) {
                bgLayer.style.transform = `translateZ(-3px) translate(${xPos * 20}px, ${yPos * 20}px)`;
            }

            // Move elements based on mouse position
            document.querySelectorAll('.elem-1, .elem-3, .elem-5').forEach(elem => {
                elem.style.transform = `translate(${xPos * 20}px, ${yPos * 20}px)`;
            });
            document.querySelectorAll('.elem-2, .elem-4, .elem-6').forEach(elem => {
                elem.style.transform = `translate(${-xPos * 25}px, ${-yPos * 25}px)`;
            });
        });
    }

    // Add some visual flair with animated text
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.getAttribute('data-text');
        heroTitle.innerHTML = '';

        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.textContent = text[i];
            span.style.animationDelay = `${i * 0.05}s`;
            heroTitle.appendChild(span);
        }
    }
});