document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 1. SCROLL PROGRESS BAR
    // ============================================================
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = `${progress}%`;
        }, { passive: true });
    }

    // ============================================================
    // 2. NAVBAR: SCROLL SHADOW
    // ============================================================
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        }, { passive: true });
    }

    // ============================================================
    // 3. MOBILE MENU TOGGLE
    // ============================================================
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenu.classList.toggle('is-active');
        });

        // Close on link click
        document.querySelectorAll('.nav-links li a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenu.classList.remove('is-active');
            });
        });
    }

    // ============================================================
    // 4. SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = 90;
                    const top = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }
        });
    });

    // ============================================================
    // 5. BACK-TO-TOP BUTTON
    // ============================================================
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================================================
    // 6. INTERSECTION OBSERVER: SCROLL ANIMATIONS
    // ============================================================
    const animatedElements = document.querySelectorAll('.animate-up, .animate-fade, .animate-left, .animate-right');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const siblings = Array.from(entry.target.parentElement.children)
                        .filter(el => el.classList.contains('animate-up') || el.classList.contains('animate-fade'));
                    const delay = siblings.indexOf(entry.target) * 100;
                    setTimeout(() => {
                        entry.target.style.animationPlayState = 'running';
                        entry.target.classList.add('visible');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        animatedElements.forEach(element => {
            element.style.animationPlayState = 'paused';
            observer.observe(element);
        });
    } else {
        animatedElements.forEach(el => {
            el.style.opacity = '1';
            el.classList.add('visible');
        });
    }

    // ============================================================
    // 7. ANIMATED NUMBER COUNTERS
    // ============================================================
    function animateCounter(el) {
        const target = el.getAttribute('data-target');
        if (!target) return;

        const raw = target.replace(/[^0-9.]/g, '');
        const suffix = target.replace(/[0-9.]/g, '');
        const end = parseFloat(raw);
        if (isNaN(end)) return;

        const duration = 2000;
        const step = 16;
        const steps = duration / step;
        const increment = end / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            el.textContent = Number.isInteger(end)
                ? Math.floor(current) + suffix
                : current.toFixed(1) + suffix;
        }, step);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-target]').forEach(el => {
        counterObserver.observe(el);
    });

    // ============================================================
    // 8. TOAST NOTIFICATION SYSTEM
    // ============================================================
    window.showToast = function (message, type = 'success', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.success}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('toast-show'));
        });

        setTimeout(() => {
            toast.classList.remove('toast-show');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, duration);
    };

    // ============================================================
    // 9. CONTACT FORM
    // ============================================================
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = this.querySelector('[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="btn-icon">⏳</span> Sending...';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                this.reset();
                showToast('✅ Thank you! Your message has been sent. We\'ll respond within 24 hours.', 'success', 5000);
            }, 1500);
        });
    }

    // ============================================================
    // 10. SEED SEARCH & FILTER
    // ============================================================
    const seedSearchInput = document.getElementById('seed-search');
    const filterPills = document.querySelectorAll('.filter-pill');
    const seedCategories = document.querySelectorAll('.seed-category');
    const varietyCards = document.querySelectorAll('.variety-card');

    if (seedSearchInput || filterPills.length > 0) {
        if (seedSearchInput) {
            seedSearchInput.addEventListener('input', applyFilters);
        }

        filterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                filterPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                applyFilters();
            });
        });
    }

    function applyFilters() {
        const searchTerm = seedSearchInput ? seedSearchInput.value.toLowerCase().trim() : '';
        const activeFilter = document.querySelector('.filter-pill.active');
        const filterValue = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';

        varietyCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const category = card.closest('.seed-category');
            const categoryText = category ? category.querySelector('h3').textContent.toLowerCase() : '';
            const combined = text + ' ' + categoryText;

            const matchesSearch = !searchTerm || combined.includes(searchTerm);
            let matchesFilter = true;

            if (filterValue === 'short') {
                matchesFilter = categoryText.includes('short');
            } else if (filterValue === 'medium') {
                matchesFilter = categoryText.includes('medium');
            } else if (filterValue === 'traditional') {
                matchesFilter = categoryText.includes('traditional');
            } else if (filterValue === 'dry') {
                matchesFilter = combined.includes('dry zone');
            } else if (filterValue === 'wet') {
                matchesFilter = combined.includes('wet zone');
            }

            card.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
        });

        seedCategories.forEach(cat => {
            const visible = Array.from(cat.querySelectorAll('.variety-card')).some(c => c.style.display !== 'none');
            cat.style.display = visible ? '' : 'none';
        });

        const noResults = document.getElementById('no-results');
        if (noResults) {
            const allHidden = Array.from(seedCategories).every(c => c.style.display === 'none');
            noResults.style.display = allHidden ? 'block' : 'none';
        }
    }

    // ============================================================
    // 11. DISEASE ACCORDION
    // ============================================================
    document.querySelectorAll('.disease-card').forEach(card => {
        const header = card.querySelector('.disease-header');
        const body = card.querySelector('.disease-body');
        if (!header || !body) return;

        const arrow = document.createElement('span');
        arrow.className = 'disease-toggle-arrow';
        arrow.innerHTML = '▼';
        header.appendChild(arrow);

        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            body.style.display = 'none';
            card.classList.add('collapsed');
        }

        header.addEventListener('click', () => {
            const isCollapsed = card.classList.contains('collapsed');
            body.style.display = isCollapsed ? 'block' : 'none';
            card.classList.toggle('collapsed');
        });
    });

    // ============================================================
    // 12. HERO TYPEWRITER EFFECT
    // ============================================================
    const typewriterEl = document.querySelector('.typewriter-text');
    if (typewriterEl) {
        const phrases = [
            'Smart Farming Solutions',
            'Modern Paddy Cultivation',
            'Empowering Farmers',
            'Agricultural Innovation'
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 80;

        function type() {
            const current = phrases[phraseIndex];

            if (isDeleting) {
                typewriterEl.textContent = current.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 40;
            } else {
                typewriterEl.textContent = current.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 80;
            }

            if (!isDeleting && charIndex === current.length) {
                typingSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typingSpeed = 400;
            }

            setTimeout(type, typingSpeed);
        }

        type();
    }

    // ============================================================
    // 13. ACTIVE NAV LINK HIGHLIGHT
    // ============================================================
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links li a').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === currentPage);
    });

});