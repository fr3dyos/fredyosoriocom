/**
 * animations.js — Antigravity-inspired animation controller
 * Handles scroll reveals, intersection observer, and dynamic animations
 */

class AnimationController {
  constructor() {
    this.elements = {
      reveals: document.querySelectorAll('.reveal, .reveal-fade, .reveal-left, .reveal-right, .reveal-scale'),
      staggerParents: document.querySelectorAll('.stagger'),
      onLoadElements: document.querySelectorAll('[data-animate-on-load]'),
      scrollElements: document.querySelectorAll('[data-animate-on-scroll]')
    };

    this.options = {
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: '0px 0px -100px 0px'
    };

    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupOnLoadAnimations();
    this.setupScrollAnimations();
    this.setupHoverEffects();
    this.setupParallax();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add animation class to reveal elements
          if (entry.target.classList.contains('reveal') ||
              entry.target.classList.contains('reveal-fade') ||
              entry.target.classList.contains('reveal-left') ||
              entry.target.classList.contains('reveal-right') ||
              entry.target.classList.contains('reveal-scale')) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }

          // Handle scroll animation elements
          if (entry.target.hasAttribute('data-animate-on-scroll')) {
            const animationClass = entry.target.getAttribute('data-animate-on-scroll');
            entry.target.classList.add('animate-on-load', animationClass);
            observer.unobserve(entry.target);
          }

          // Handle io-transform classes
          if (entry.target.classList.contains('io-transform-hidden')) {
            entry.target.classList.remove('io-transform-hidden');
            entry.target.classList.add('io-transform-visible');
            observer.unobserve(entry.target);
          }
        }
      });
    }, this.options);

    // Observe all reveal elements
    this.elements.reveals.forEach(el => observer.observe(el));
    this.elements.scrollElements.forEach(el => observer.observe(el));

    // Observe io-transform elements
    document.querySelectorAll('.io-transform-hidden').forEach(el => observer.observe(el));
  }

  setupOnLoadAnimations() {
    this.elements.onLoadElements.forEach((element, index) => {
      const animation = element.getAttribute('data-animate-on-load');
      const delay = element.getAttribute('data-animation-delay');

      if (animation) {
        element.classList.add('animate-on-load', animation);
        if (delay) {
          element.style.animationDelay = `${delay}ms`;
        }
      }
    });

    // Setup staggered animations
    this.elements.staggerParents.forEach(parent => {
      parent.classList.add('animate-on-load');
      Array.from(parent.children).forEach((child, index) => {
        const animationType = parent.getAttribute('data-stagger-animation') || 'animate-fade-in-up';
        child.classList.add(animationType);
        child.style.animationDelay = `${index * 100}ms`;
      });
    });
  }

  setupScrollAnimations() {
    let ticking = false;
    const scrollElements = document.querySelectorAll('[data-scroll-animation]');

    const handleScroll = () => {
      scrollElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        const progress = 1 - (rect.top / window.innerHeight);

        if (element.getAttribute('data-scroll-animation') === 'fade') {
          element.style.opacity = Math.max(0, Math.min(1, progress));
        }

        if (element.getAttribute('data-scroll-animation') === 'slide-up') {
          element.style.transform = `translateY(${Math.max(0, (1 - progress) * 50)}px)`;
          element.style.opacity = Math.max(0, Math.min(1, progress));
        }

        if (element.getAttribute('data-scroll-animation') === 'parallax') {
          const parallaxIntensity = element.getAttribute('data-parallax-intensity') || 0.5;
          element.style.transform = `translateY(${(window.scrollY - element.offsetTop) * parallaxIntensity}px)`;
        }
      });

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    });

    // Initial call
    handleScroll();
  }

  setupHoverEffects() {
    const hoverElements = document.querySelectorAll('[data-hover-effect]');

    hoverElements.forEach(element => {
      const effect = element.getAttribute('data-hover-effect');
      element.classList.add(effect);
    });
  }

  setupParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    if (parallaxElements.length === 0) return;

    let ticking = false;

    const updateParallax = () => {
      parallaxElements.forEach(element => {
        const intensity = parseFloat(element.getAttribute('data-parallax')) || 0.5;
        const rect = element.getBoundingClientRect();
        const distance = window.scrollY - element.offsetTop + window.innerHeight / 2;
        const offset = distance * intensity;

        element.style.transform = `translateY(${offset * 0.1}px)`;
      });

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    // Initial call
    updateParallax();
  }

  // Public methods for manual animation triggers
  triggerAnimation(element, animationClass, removeAfter = false) {
    element.classList.add(animationClass);

    if (removeAfter) {
      element.addEventListener('animationend', () => {
        element.classList.remove(animationClass);
      }, { once: true });
    }
  }

  triggerElementReveal(element) {
    element.classList.add('active');
  }

  resetRevealElement(element) {
    element.classList.remove('active');
  }

  // Stagger animation trigger
  triggerStaggerAnimation(parentElement, animationClass) {
    Array.from(parentElement.children).forEach((child, index) => {
      setTimeout(() => {
        child.classList.add(animationClass);
      }, index * 100);
    });
  }
}

// Initialize animations when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.animationController = new AnimationController();
  });
} else {
  window.animationController = new AnimationController();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationController;
}
