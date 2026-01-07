/* ===================================
   VENCEYA Landing Page - JavaScript
   Optimized with accessibility and performance
   =================================== */

/* ===================================
   CONFIGURATION CONSTANTS
   =================================== */
const CONFIG = {
    // Header
    HEADER_SCROLL_THRESHOLD: 100,
    HEADER_OFFSET: 80,

    // Animations
    COUNTER_DURATION: 2000,
    COUNTER_INTERVAL: 16,
    PARALLAX_MAX_SCROLL: 600,
    PARALLAX_FACTOR: 0.5,

    // Notifications
    NOTIFICATION_DURATION: 4000,
    NOTIFICATION_FADE_IN: 300,

    // Form validation
    PHONE_REGEX: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    // Intersection Observer
    OBSERVER_THRESHOLD: 0.2,
    OBSERVER_ROOT_MARGIN: '0px',

    // Mobile
    MOBILE_BREAKPOINT: 768
};

/* ===================================
   UTILITY FUNCTIONS
   =================================== */

// Debounce function
function debounce(func, wait = 250) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit = 250) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if user prefers reduced motion
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Smooth scroll to element
function smoothScrollTo(targetId) {
    const target = document.querySelector(targetId);
    if (!target) return;

    const headerOffset = CONFIG.HEADER_OFFSET;
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

/* ===================================
   HEADER & NAVIGATION
   =================================== */

// Header scroll effect
const header = document.querySelector('.header');

function updateHeaderOnScroll() {
    if (window.scrollY > CONFIG.HEADER_SCROLL_THRESHOLD) {
        header?.classList.add('scrolled');
    } else {
        header?.classList.remove('scrolled');
    }
}

// Throttled scroll handler for header
const throttledHeaderUpdate = throttle(updateHeaderOnScroll, 100);
window.addEventListener('scroll', throttledHeaderUpdate);

// Mobile navigation toggle
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');

function toggleMobileNav() {
    const isActive = mobileNav.classList.toggle('active');
    navToggle?.classList.toggle('active');

    // Update ARIA attributes
    navToggle?.setAttribute('aria-expanded', isActive);
    mobileNav?.setAttribute('aria-hidden', !isActive);

    // Prevent body scroll when menu is open
    if (isActive) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function closeMobileNav() {
    mobileNav?.classList.remove('active');
    navToggle?.classList.remove('active');
    navToggle?.setAttribute('aria-expanded', 'false');
    mobileNav?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

navToggle?.addEventListener('click', toggleMobileNav);

// Close mobile nav when clicking on a link
document.querySelectorAll('.mobile-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            closeMobileNav();
            setTimeout(() => smoothScrollTo(href), 300);
        }
    });
});

// Close mobile nav when clicking outside
document.addEventListener('click', (e) => {
    if (mobileNav?.classList.contains('active') &&
        !mobileNav.contains(e.target) &&
        !navToggle?.contains(e.target)) {
        closeMobileNav();
    }
});

// Handle escape key to close mobile nav
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav?.classList.contains('active')) {
        closeMobileNav();
        navToggle?.focus();
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // IGNORE ROCKET BUTTONS (handled by specific logic)
        if (this.classList.contains('js-rocket-btn')) return;

        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        smoothScrollTo(href);
    });
});

/* ===================================
   HERO SECTION ANIMATIONS
   =================================== */

// Animated counter
function animateCounter(element, target, duration = CONFIG.COUNTER_DURATION) {
    if (prefersReducedMotion()) {
        element.textContent = target;
        return;
    }

    const start = 0;
    const increment = target / (duration / CONFIG.COUNTER_INTERVAL);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, CONFIG.COUNTER_INTERVAL);
}

// Parallax effect for hero background (with reduced motion check)
function handleParallax() {
    if (prefersReducedMotion()) return;

    const heroBg = document.querySelector('.hero-bg-visuals');
    if (!heroBg) return;

    const scrolled = window.pageYOffset;
    if (scrolled < CONFIG.PARALLAX_MAX_SCROLL) {
        const offset = scrolled * CONFIG.PARALLAX_FACTOR;
        heroBg.style.transform = `translateY(${offset}px)`;
    }
}

// Mouse move effect for hero mockup
function handleHeroMockupParallax(e) {
    if (prefersReducedMotion()) return;

    const mockup = document.querySelector('.mockup-frame');
    if (!mockup) return;

    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    const xPos = (clientX / innerWidth - 0.5) * 20;
    const yPos = (clientY / innerHeight - 0.5) * 20;

    mockup.style.transform = `rotateY(${xPos - 5}deg) rotateX(${-yPos + 2}deg)`;
}

// Add mousemove listener if desktop
if (window.innerWidth > CONFIG.MOBILE_BREAKPOINT && !prefersReducedMotion()) {
    document.querySelector('.hero')?.addEventListener('mousemove', handleHeroMockupParallax);
}


// Debounced parallax handler
const debouncedParallax = debounce(handleParallax, 10);

/* ===================================
   INTERSECTION OBSERVER (Unified)
   =================================== */

// Single unified observer for all animations and counters
const observerOptions = {
    threshold: CONFIG.OBSERVER_THRESHOLD,
    rootMargin: CONFIG.OBSERVER_ROOT_MARGIN
};

// Track which elements have been animated
const animatedElements = new Set();

const unifiedObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;

            // Skip if already animated
            if (animatedElements.has(element)) return;
            animatedElements.add(element);

            // Handle fade-in animations
            if (element.classList.contains('fade-in')) {
                element.classList.add('visible');
            }

            // Handle counter animations
            if (element.classList.contains('stat-number')) {
                const target = parseInt(element.getAttribute('data-target'), 10);
                if (!isNaN(target)) {
                    animateCounter(element, target);
                }
            }

            // Unobserve after animation to save resources
            if (!element.classList.contains('fade-in')) {
                unifiedObserver.unobserve(element);
            }
        }
    });
}, observerOptions);

// Observe all animatable elements
document.addEventListener('DOMContentLoaded', () => {
    // Observe fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        unifiedObserver.observe(el);
    });

    // Observe stat numbers
    document.querySelectorAll('.stat-number').forEach(el => {
        unifiedObserver.observe(el);
    });

    // Add fade-in class to sections for scroll animations
    if (!prefersReducedMotion()) {
        document.querySelectorAll('.problema-item, .beneficio-card, .modulo-card, .testimonio-card').forEach(el => {
            el.classList.add('fade-in');
            unifiedObserver.observe(el);
        });
    }
});

/* ===================================
   FORM HANDLING & VALIDATION
   =================================== */

const demoForm = document.getElementById('demoForm');

// Real-time field validation
function validateField(input) {
    const value = input.value.trim();
    const name = input.name;
    let isValid = true;
    let errorMessage = '';

    // Check required
    if (input.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Este campo es requerido';
    }

    // Specific validations
    if (value) {
        switch (name) {
            case 'email':
                if (!CONFIG.EMAIL_REGEX.test(value)) {
                    isValid = false;
                    errorMessage = 'Por favor ingresa un email válido';
                }
                break;
            case 'telefono':
                if (!CONFIG.PHONE_REGEX.test(value)) {
                    isValid = false;
                    errorMessage = 'Por favor ingresa un teléfono válido';
                }
                break;
            case 'nombre':
                if (value.length < 3) {
                    isValid = false;
                    errorMessage = 'El nombre debe tener al menos 3 caracteres';
                }
                break;
        }
    }

    // Update UI
    const formGroup = input.closest('.form-group');
    if (formGroup) {
        if (isValid) {
            formGroup.classList.remove('error');
            input.setCustomValidity('');
        } else {
            formGroup.classList.add('error');
            input.setCustomValidity(errorMessage);

            // Show error message if element exists
            let errorEl = formGroup.querySelector('.error-message');
            if (!errorEl) {
                errorEl = document.createElement('span');
                errorEl.className = 'error-message';
                formGroup.appendChild(errorEl);
            }
            errorEl.textContent = errorMessage;
        }
    }

    return isValid;
}

// Add real-time validation to all form inputs
demoForm?.querySelectorAll('input, select').forEach(input => {
    // Validate on blur
    input.addEventListener('blur', () => validateField(input));

    // Clear errors on input
    input.addEventListener('input', debounce(() => {
        if (input.value.trim()) {
            validateField(input);
        }
    }, 500));
});

// Form submission
demoForm?.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Validate all fields
    let isValid = true;
    const formData = {};

    this.querySelectorAll('input, select').forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
        formData[input.name] = input.value.trim();
    });

    if (!isValid) {
        showNotification('Por favor corrige los errores en el formulario', 'error');
        // Focus first invalid field
        const firstError = this.querySelector('.form-group.error input, .form-group.error select');
        firstError?.focus();
        return;
    }

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn?.innerHTML;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    }

    // Prepare WhatsApp Message
    const whatsappNumber = "56999917833";
    const message = `*Nueva Solicitud de Demo VENCEYA*%0A%0A` +
        `*Nombre:* ${formData.nombre}%0A` +
        `*Email:* ${formData.email}%0A` +
        `*Empresa:* ${formData.empresa}%0A` +
        `*Teléfono:* ${formData.telefono}%0A` +
        `*Área:* ${formData.area}`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    try {
        // Show success notification
        showNotification('Redirigiendo a WhatsApp...', 'success');

        // Wait a bit for the notification to be seen
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Redirect to WhatsApp
        window.open(whatsappUrl, '_blank');

        this.reset();

        // Remove error states
        this.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });

    } catch (error) {
        showNotification('Error al procesar la solicitud', 'error');
    } finally {
        // Restore button
        if (submitBtn && originalText) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = originalText;
        }
    }
});

/* ===================================
   NOTIFICATION SYSTEM
   =================================== */

function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    const icon = type === 'success'
        ? '<i class="fas fa-check-circle"></i>'
        : '<i class="fas fa-exclamation-circle"></i>';

    notification.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Auto remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, CONFIG.NOTIFICATION_DURATION);
}

/* ===================================
   SCROLL ENHANCEMENTS
   =================================== */

// Only add parallax if motion is not reduced
if (!prefersReducedMotion()) {
    window.addEventListener('scroll', debouncedParallax, { passive: true });
}

/* ===================================
   ACCESSIBILITY ENHANCEMENTS
   =================================== */

// Trap focus in mobile menu when open
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                lastFocusable?.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                firstFocusable?.focus();
                e.preventDefault();
            }
        }
    });
}

// Apply focus trap to mobile nav when active
const mobileNavObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const isActive = mobileNav?.classList.contains('active');
            if (isActive) {
                trapFocus(mobileNav);
            }
        }
    });
});

if (mobileNav) {
    mobileNavObserver.observe(mobileNav, { attributes: true });
}

/* ===================================
   PERFORMANCE MONITORING
   =================================== */

// Log performance metrics in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', () => {
        if (window.performance && window.performance.timing) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const connectTime = perfData.responseEnd - perfData.requestStart;
            const renderTime = perfData.domComplete - perfData.domLoading;

            console.log('🚀 VENCEYA Performance Metrics:');
            console.log(`   Page Load Time: ${pageLoadTime}ms`);
            console.log(`   Connect Time: ${connectTime}ms`);
            console.log(`   Render Time: ${renderTime}ms`);
        }
    });
}

/* ===================================
   INITIALIZATION
   =================================== */

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Initial header state
    updateHeaderOnScroll();

    // Log initialization in dev
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('✅ VENCEYA Landing Page initialized');
        console.log('   Reduced Motion:', prefersReducedMotion());
        console.log('   Viewport:', `${window.innerWidth}x${window.innerHeight}`);
    }
});

/* ===================================
   HANDLE PAGE VISIBILITY CHANGES
   =================================== */

// Pause/resume animations when page is hidden/visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause any ongoing animations or timers when page is hidden
        window.removeEventListener('scroll', throttledHeaderUpdate);
        window.removeEventListener('scroll', debouncedParallax);
    } else {
        // Resume when page becomes visible
        window.addEventListener('scroll', throttledHeaderUpdate);
        if (!prefersReducedMotion()) {
            window.addEventListener('scroll', debouncedParallax, { passive: true });
        }
    }
});

/* ===================================
   HANDLE WINDOW RESIZE
   =================================== */

// Handle resize with debouncing
const handleResize = debounce(() => {
    // Close mobile nav on resize to desktop
    if (window.innerWidth > CONFIG.MOBILE_BREAKPOINT) {
        closeMobileNav();
    }

    // Log in dev
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('📐 Viewport resized:', `${window.innerWidth}x${window.innerHeight}`);
    }
}, 250);

window.addEventListener('resize', handleResize);

/* ===================================
   ROCKET LAUNCH EFFECT
   Premium UX for CTA buttons
   =================================== */

// Función para manejar el efecto de lanzamiento del cohete
function handleRocketLaunch(event) {
    // IMPORTANTE: Prevenir la navegación por defecto PRIMERO
    event.preventDefault();
    event.stopPropagation();

    const button = event.currentTarget;
    const targetHref = button.getAttribute('href');

    // Solo aplicar si tiene un cohete
    const hasRocket = button.querySelector('.fa-rocket');
    if (!hasRocket) {
        // Si no tiene cohete, navegar normalmente
        if (targetHref && targetHref.startsWith('#')) {
            smoothScrollTo(targetHref);
        } else {
            window.location.href = targetHref;
        }
        return;
    }

    // Si ya está lanzando, ignorar
    if (button.classList.contains('launching')) {
        return;
    }

    // Verificar si el usuario prefiere movimiento reducido
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Si prefiere movimiento reducido, navegar inmediatamente
        if (targetHref && targetHref.startsWith('#')) {
            smoothScrollTo(targetHref);
        } else {
            window.location.href = targetHref;
        }
        return;
    }

    // Agregar clase de lanzamiento
    button.classList.add('launching');

    // Después de la animación (1.2s), navegar al destino
    setTimeout(() => {
        // Navegación suave
        if (targetHref && targetHref.startsWith('#')) {
            // Si es un ancla interna, hacer scroll suave
            const targetElement = document.querySelector(targetHref);
            if (targetElement) {
                smoothScrollTo(targetHref);
            }
        } else {
            // Si es una URL externa, navegar
            window.location.href = targetHref;
        }

        // Remover clase después de navegar (para cuando vuelvan)
        setTimeout(() => {
            button.classList.remove('launching');
        }, 100);
    }, 300); // 0.3 segundos - duración ULTRA RÁPIDA
}

// Seleccionar botones ESPECÍFICOS con la clase js-rocket-btn
document.addEventListener('DOMContentLoaded', () => {
    const rocketButtons = document.querySelectorAll('.js-rocket-btn');

    rocketButtons.forEach(button => {
        // Use capture: true to handle event BEFORE bubble phase
        button.addEventListener('click', handleRocketLaunch, { capture: true });
    });

    // Log en desarrollo
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🚀 Rocket Launch Effect initialized on', rocketButtons.length, 'buttons (Shielded Mode)');
    }
});
