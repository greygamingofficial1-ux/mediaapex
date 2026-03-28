// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Create mobile menu
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.innerHTML = `
        <ul class="mobile-nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#ecosystem">Ecosystem</a></li>
            <li><a href="#performance">Performance</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    `;
    
    // Add mobile menu styles
    const style = document.createElement('style');
    style.textContent = `
        .mobile-menu {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background: rgba(10, 10, 10, 0.98);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            transform: translateY(-100%);
            transition: transform 0.3s ease;
            z-index: 999;
            padding: 2rem 0;
        }
        
        .mobile-menu.active {
            transform: translateY(0);
        }
        
        .mobile-nav-menu {
            list-style: none;
            padding: 0 2rem;
        }
        
        .mobile-nav-menu li {
            margin-bottom: 1rem;
        }
        
        .mobile-nav-menu a {
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
            font-size: 1.1rem;
            transition: color 0.3s ease;
            display: block;
            padding: 0.5rem 0;
        }
        
        .mobile-nav-menu a:hover {
            color: var(--text-primary);
        }
        
        .nav-toggle.active span:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }
        
        .nav-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .nav-toggle.active span:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(mobileMenu);
    
    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking links
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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

// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Add scroll animation styles
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    .fade-in {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-in-left {
        opacity: 0;
        transform: translateX(-30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-in-right {
        opacity: 0;
        transform: translateX(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
`;
document.head.appendChild(animationStyle);

// Apply animations to elements
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = [
        { selector: '.feature-card', class: 'fade-in' },
        { selector: '.stat-card', class: 'fade-in' },
        { selector: '.ecosystem-text', class: 'fade-in-left' },
        { selector: '.ecosystem-visual', class: 'fade-in-right' },
        { selector: '.section-header', class: 'fade-in' },
        { selector: '.cta-content', class: 'fade-in' }
    ];
    
    animatedElements.forEach(({ selector, class: animationClass }) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
            el.classList.add(animationClass);
            el.style.transitionDelay = `${index * 0.1}s`;
            observer.observe(el);
        });
    });
});

// Parallax Effect for Hero Section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Dynamic Stats Counter
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = element.dataset.finalText || target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Initialize counters when visible
const counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            const finalText = entry.target.textContent;
            entry.target.dataset.finalText = finalText;
            
            // Extract number from text
            const numberMatch = finalText.match(/[\d.]+/);
            if (numberMatch) {
                const number = parseFloat(numberMatch[0]);
                animateCounter(entry.target, number);
            }
        }
    });
}, { threshold: 0.5 });

// Apply to stat numbers
document.addEventListener('DOMContentLoaded', function() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        counterObserver.observe(stat);
    });
});

// Button Hover Effects
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseenter', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.width = ripple.style.height = '0px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.pointerEvents = 'none';
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.style.transition = 'width 0.6s, height 0.6s';
            ripple.style.width = ripple.style.height = '300px';
        }, 10);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Header Scroll Effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    const header = document.querySelector('.header');
    
    if (header) {
        if (currentScroll > 100) {
            header.style.background = 'rgba(10, 10, 10, 0.98)';
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.background = 'rgba(10, 10, 10, 0.95)';
            header.style.boxShadow = 'none';
        }
    }
    
    lastScroll = currentScroll;
});

// Form Validation (for future contact forms)
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Loading Animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Console Easter Egg
console.log('%c🎮 Welcome to Grey Gaming! 🎮', 'font-size: 20px; color: #6366f1; font-weight: bold;');
console.log('%cBuilt with passion for gaming enthusiasts', 'font-size: 14px; color: #8b5cf6;');
