document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Mobile Navigation Toggle ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-cta');

    if (mobileMenuBtn && mobileNavOverlay) {
        mobileMenuBtn.addEventListener('click', () => {
            const isActive = mobileMenuBtn.classList.toggle('active');
            mobileNavOverlay.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', isActive);
            mobileNavOverlay.setAttribute('aria-hidden', !isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileNavOverlay.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNavOverlay.classList.contains('active')) {
                mobileMenuBtn.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileNavOverlay.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        });
    }

    // --- Intersection Observer for Fade-ins (motion allowed only) ---
    if (!prefersReducedMotion) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
    }

    // --- Smooth Scroll for Anchors (respect reduced motion) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#') && !href.includes('?')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: prefersReducedMotion ? 'auto' : 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // --- Pre-select Form Option based on Query Param ---
    function getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    const trackParam = getQueryParam('track');
    const trackSelect = document.getElementById('track');

    if (trackParam && trackSelect) {
        if ([...trackSelect.options].some(option => option.value === trackParam)) {
            trackSelect.value = trackParam;

            const deploySection = document.getElementById('deploy');
            if (deploySection) {
                setTimeout(() => {
                    deploySection.scrollIntoView({
                        behavior: prefersReducedMotion ? 'auto' : 'smooth',
                        block: 'center'
                    });
                }, prefersReducedMotion ? 0 : 500);
            }
        }
    }
});
