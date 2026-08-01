// main.js — theme toggle, mobile nav, monogram fallback, scroll header/nav highlight
(function () {
  'use strict';

  // ============ Theme ============
  const THEME_KEY = 'cv-website-theme';
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      const sun = btn.querySelector('.icon-sun');
      const moon = btn.querySelector('.icon-moon');
      if (sun) sun.style.display = theme === 'dark' ? 'none' : 'inline-block';
      if (moon) moon.style.display = theme === 'dark' ? 'inline-block' : 'none';
    }
  }

  function detectInitialTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function toggleTheme() {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  function initTheme() {
    applyTheme(detectInitialTheme());
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);
  }

  // ============ Mobile nav ============
  function initMobileNav() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('hidden') === false; // becomes visible when 'hidden' removed
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        menu.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ============ Footer year ============
  function initYear() {
    const y = document.getElementById('year');
    if (y && !y.textContent) y.textContent = new Date().getFullYear();
  }

  // ============ Monogram avatar fallback ============
  function makeMonogram(initials) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('class', 'monogram');
    svg.setAttribute('aria-label', 'Monogram');
    svg.setAttribute('role', 'img');

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('width', '200');
    rect.setAttribute('height', '200');
    svg.appendChild(rect);

    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', '100');
    text.setAttribute('y', '118');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '72');
    text.setAttribute('font-weight', '700');
    text.setAttribute('font-family', 'Inter, system-ui, sans-serif');
    text.setAttribute('letter-spacing', '-2');
    text.textContent = initials || 'F';
    svg.appendChild(text);

    return svg;
  }
  window.makeMonogram = makeMonogram;

  // ============ Scroll: hide header + active nav highlight ============
  function initScroll() {
    let lastScrollTop = 0;
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (header) {
        if (scrollTop > lastScrollTop && scrollTop > 100) {
          header.style.transform = 'translateY(-100%)';
        } else {
          header.style.transform = 'translateY(0)';
        }
      }
      lastScrollTop = scrollTop;

      const sections = document.querySelectorAll('main section[id]');
      const navLinks = document.querySelectorAll('#nav-links a, #mobile-menu a');

      let current = '';
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 160) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('#')) return;

        link.classList.remove('text-primary', 'font-bold');
        link.classList.add('text-on-surface/70');
        const line = link.querySelector('.nav-active-line');
        if (line) line.remove();

        if (href.slice(1) === current) {
          link.classList.add('text-primary', 'font-bold');
          link.classList.remove('text-on-surface/70');
          const div = document.createElement('div');
          div.className = 'nav-active-line';
          link.appendChild(div);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileNav();
    initYear();
    initScroll();
  });
})();

