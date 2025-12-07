document.addEventListener('DOMContentLoaded', () => {

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
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isActive ? 'hidden' : '';
        });
        
        // Close menu when clicking a link
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileNavOverlay.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu on escape key
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

    // --- Intersection Observer for Fade-ins ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-up');
    animatedElements.forEach(el => observer.observe(el));

    // --- Hero Content Animation on Load ---
    setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            // Ensure initial state is set in CSS or handle here
            heroContent.style.opacity = '0';
            heroContent.style.transform = 'translateY(20px)';
            
            // Trigger reflow
            void heroContent.offsetWidth;
            
            heroContent.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }
    }, 100);

    // --- Smooth Scroll for Anchors ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Only scroll if it's an anchor on the same page
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
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
                    deploySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }
        }
    }
});

