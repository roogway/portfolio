// =====================================================
// RAGHVI PORTFOLIO - MAIN JS
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('nav-open');
            navToggle.classList.toggle('nav-toggle-active');
        });
    }

    // Nav scroll effect - transparent at top, white when scrolled
    // Only applies on homepage (index.html) - other pages stay solid
    const nav = document.querySelector('.nav');
    const isHomepage = window.location.pathname === '/' || 
                       window.location.pathname.endsWith('index.html') ||
                       window.location.pathname === '';
    
    if (nav) {
        if (isHomepage) {
            const handleScroll = () => {
                if (window.scrollY > 50) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
            };
            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll(); // Check initial state
        } else {
            // Non-homepage: always show solid nav
            nav.classList.add('scrolled');
        }
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('.project-card, .value-card, .case-section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add visible class styles
    const style = document.createElement('style');
    style.textContent = `
        .is-visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        .nav-open {
            display: flex !important;
            position: fixed;
            top: var(--nav-height);
            left: 0;
            right: 0;
            background: var(--color-bg);
            flex-direction: column;
            padding: var(--space-lg);
            border-bottom: 1px solid var(--color-border);
            gap: var(--space-sm);
        }
        
        .nav-toggle-active span:first-child {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .nav-toggle-active span:last-child {
            transform: rotate(-45deg) translate(5px, -5px);
        }
    `;
    document.head.appendChild(style);

    // Stagger animations for cards
    document.querySelectorAll('.work-grid .project-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });

    document.querySelectorAll('.value-props .value-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });

    // =====================================================
    // INTERACTIVE FLOATING SHAPES - Cursor Following
    // =====================================================
    const floatShapes = document.querySelectorAll('.float-shape');
    
    if (floatShapes.length > 0) {
        // Store original positions
        const shapeData = [];
        floatShapes.forEach((shape, index) => {
            const rect = shape.getBoundingClientRect();
            shapeData.push({
                element: shape,
                speed: parseFloat(shape.dataset.speed) || 0.03,
                x: 0,
                y: 0,
                targetX: 0,
                targetY: 0
            });
        });

        // Track mouse position
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Calculate offset from center
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const offsetX = (mouseX - centerX);
            const offsetY = (mouseY - centerY);

            // Update target positions for each shape
            shapeData.forEach((data) => {
                data.targetX = offsetX * data.speed;
                data.targetY = offsetY * data.speed;
            });
        });

        // Smooth animation loop
        function animateShapes() {
            shapeData.forEach((data) => {
                // Ease towards target position
                data.x += (data.targetX - data.x) * 0.08;
                data.y += (data.targetY - data.y) * 0.08;
                
                // Apply transform
                data.element.style.transform = `translate(${data.x}px, ${data.y}px)`;
            });
            
            requestAnimationFrame(animateShapes);
        }

        // Start animation
        animateShapes();

        // Reset on mouse leave
        document.addEventListener('mouseleave', () => {
            shapeData.forEach((data) => {
                data.targetX = 0;
                data.targetY = 0;
            });
        });
    }

    // =====================================================
    // DRAGGABLE STICKERS
    // =====================================================
    const stickers = document.querySelectorAll('.sticker');
    
    stickers.forEach(sticker => {
        let isDragging = false;
        let startX, startY;
        let offsetX = 0, offsetY = 0;
        
        // Get initial position from CSS custom properties
        const computedStyle = getComputedStyle(sticker);
        let currentX = parseFloat(sticker.style.getPropertyValue('--x')) || 50;
        let currentY = parseFloat(sticker.style.getPropertyValue('--y')) || 50;
        
        // Mouse events
        sticker.addEventListener('mousedown', (e) => {
            // Don't start drag if clicking on popover link
            if (e.target.closest('.sticker-popover a, .popover-cta')) return;
            
            isDragging = true;
            sticker.classList.add('dragging');
            
            const rect = sticker.getBoundingClientRect();
            const parent = sticker.parentElement.getBoundingClientRect();
            
            startX = e.clientX;
            startY = e.clientY;
            offsetX = rect.left - parent.left;
            offsetY = rect.top - parent.top;
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const parent = sticker.parentElement.getBoundingClientRect();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            const newX = ((offsetX + dx) / parent.width) * 100;
            const newY = ((offsetY + dy) / parent.height) * 100;
            
            sticker.style.setProperty('--x', `${Math.max(0, Math.min(95, newX))}%`);
            sticker.style.setProperty('--y', `${Math.max(0, Math.min(95, newY))}%`);
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                sticker.classList.remove('dragging');
            }
        });
        
        // Touch events for mobile
        sticker.addEventListener('touchstart', (e) => {
            if (e.target.closest('.sticker-popover a, .popover-cta')) return;
            
            isDragging = true;
            sticker.classList.add('dragging');
            
            const touch = e.touches[0];
            const rect = sticker.getBoundingClientRect();
            const parent = sticker.parentElement.getBoundingClientRect();
            
            startX = touch.clientX;
            startY = touch.clientY;
            offsetX = rect.left - parent.left;
            offsetY = rect.top - parent.top;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const touch = e.touches[0];
            const parent = sticker.parentElement.getBoundingClientRect();
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            
            const newX = ((offsetX + dx) / parent.width) * 100;
            const newY = ((offsetY + dy) / parent.height) * 100;
            
            sticker.style.setProperty('--x', `${Math.max(0, Math.min(95, newX))}%`);
            sticker.style.setProperty('--y', `${Math.max(0, Math.min(95, newY))}%`);
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                sticker.classList.remove('dragging');
            }
        });
    });
    
    // =====================================================
    // MOBILE POPOVER TOGGLE
    // =====================================================
    // On touch devices, tap toggles popover instead of hover
    if ('ontouchstart' in window) {
        stickers.forEach(sticker => {
            sticker.addEventListener('click', (e) => {
                // Don't toggle if clicking a link
                if (e.target.closest('a, .popover-cta-modal')) return;
                
                // Close other popovers
                stickers.forEach(s => {
                    if (s !== sticker) s.classList.remove('active');
                });
                
                // Toggle this popover
                sticker.classList.toggle('active');
            });
        });
        
        // Close popovers when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.sticker')) {
                stickers.forEach(s => s.classList.remove('active'));
            }
        });
    }
    
    // =====================================================
    // NOTEBOOK MODAL
    // =====================================================
    const notebookSticker = document.querySelector('.sticker-notebook');
    const notebookModal = document.getElementById('notebook-modal');
    const notebookClose = document.querySelector('.notebook-close');
    
    if (notebookSticker && notebookModal) {
        // Open modal when clicking the notebook sticker's CTA
        notebookSticker.addEventListener('click', (e) => {
            if (e.target.closest('.popover-cta-modal')) {
                notebookModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        });
        
        // Close modal
        const closeModal = () => {
            notebookModal.classList.remove('open');
            document.body.style.overflow = '';
        };
        
        if (notebookClose) {
            notebookClose.addEventListener('click', closeModal);
        }
        
        // Close on backdrop click
        notebookModal.addEventListener('click', (e) => {
            if (e.target === notebookModal) {
                closeModal();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && notebookModal.classList.contains('open')) {
                closeModal();
            }
        });
    }

    // Console greeting
    console.log('%c👋 Hey there!', 'font-size: 24px; font-weight: bold;');
    console.log('%cThanks for checking out my portfolio code.', 'font-size: 14px;');
    console.log('%cBuilt with care by Raghvi', 'font-size: 12px; color: #6B6B6B;');
});
