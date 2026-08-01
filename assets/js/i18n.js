// i18n.js — load translations, swap text, persist language choice
(function () {
  'use strict';

  const SUPPORTED = ['en', 'pt-BR', 'es-CO'];
  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'cv-website-lang';

  const HTML_LANG = { 'en': 'en', 'pt-BR': 'pt-BR', 'es-CO': 'es-CO' };
  const bundles = {};

  async function loadBundle(lang) {
    if (bundles[lang]) return bundles[lang];
    const res = await fetch(`assets/i18n/${lang}.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to load ${lang}.json`);
    bundles[lang] = await res.json();
    return bundles[lang];
  }

  function resolve(obj, key) {
    // Support flat dotted keys as used in the JSON bundles ("nav.publications"),
    // and fall back to nested-object traversal for robustness.
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];
    return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  function escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#39;');
  }

  function applyTranslations(bundle) {
    // Static text via data-i18n="key"
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      // Skip list-container placeholders (handled in render functions)
      if (key === 'experience' || key === 'projects' || key === 'education' ||
          key === 'publications' || key === 'patents' ||
          key === 'spoken' || key === 'programming') return;
      const value = resolve(bundle, key);
      if (typeof value === 'string') {
        // Void elements (img, input, etc.) can only have attribute swaps; skip innerHTML
        if (/^(IMG|INPUT|BR|HR|META|LINK|SOURCE)$/.test(el.tagName)) return;
        el.innerHTML = value;
      }
    });

    // data-i18n-attr="attr:key" — translate one HTML attribute
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const spec = el.getAttribute('data-i18n-attr');
      const [attr, key] = spec.split(':');
      const value = resolve(bundle, key);
      if (attr && typeof value === 'string') el.setAttribute(attr, value);
    });

    // Page <title>
    const titleVal = resolve(bundle, 'meta.title');
    if (titleVal) document.title = titleVal;

    renderExperience(bundle.experience || []);
    renderProjects(bundle.projects || []);
    renderPublications(bundle.publications || []);
    renderPatents(bundle.patents || []);
    renderEducation(bundle.education || []);
    renderSpoken(bundle.spoken || []);
    renderProgramming(bundle.programming || []);

    document.documentElement.lang = HTML_LANG[currentLang] || 'en';

    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  // ---------- Experience: timeline ----------
  function renderExperience(items) {
    const list = document.getElementById('experience-list');
    if (!list) return;
    list.innerHTML = items.map((it) => `
      <li class="relative">
        <div class="timeline-dot" aria-hidden="true"></div>
        <div class="glass-panel p-8 hover:border-primary/50 transition-colors">
          <div class="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <h3 class="font-headline text-xl text-on-surface font-semibold">${escape(it.role)}</h3>
              <p class="text-primary font-code text-xs mt-1 uppercase tracking-wider">${escape(it.company)} · ${escape(it.place)} · ${escape(it.domain)}</p>
            </div>
            <span class="text-on-surface/40 font-code text-xs mt-2 md:mt-0">${escape(it.period)}</span>
          </div>
          <ul class="space-y-4 text-on-surface/70 text-sm leading-relaxed">
            ${it.bullets.map((b) => `<li class="flex gap-3"><span class="text-primary">/</span> ${escape(b)}</li>`).join('')}
          </ul>
        </div>
      </li>
    `).join('');
  }

  // ---------- Projects: neon cards ----------
  const PROJECT_ICONS = {
    'AI / ML': 'fa-brain',
    'IA / ML': 'fa-brain',
    'Instrumentation': 'fa-microscope',
    'Instrumentación': 'fa-microscope',
    'Instrumentação': 'fa-microscope',
    'Computer Vision': 'fa-eye',
    'Visión por Computador': 'fa-eye',
    'Visão Computacional': 'fa-eye',
    'Hardware / Control': 'fa-microchip',
    'Hardware / Controle': 'fa-microchip'
  };

  function renderProjects(items) {
    const list = document.getElementById('project-list');
    if (!list) return;
    list.innerHTML = items.map((p, i) => {
      const href = p.url ? escape(p.url) : '#';
      const icon = PROJECT_ICONS[p.category] || 'fa-code';
      const spanClass = i === 0 ? 'md:col-span-2 lg:col-span-2' : '';
      return `
      <li class="glass-panel p-8 neon-border flex flex-col group ${spanClass}">
        <div class="w-12 h-12 border border-primary/50 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
          <i class="fa-solid ${icon}" aria-hidden="true"></i>
        </div>
        <h3 class="font-headline text-2xl font-bold mb-4 text-on-surface">${escape(p.name)}</h3>
        <p class="text-on-surface/60 text-sm mb-10 leading-relaxed">${escape(p.description)}</p>
        <div class="mt-auto flex flex-wrap justify-between items-center gap-4">
          <div class="flex flex-wrap gap-3">
            ${p.category ? `<span class="text-[10px] font-code uppercase tracking-wider text-primary border border-primary/30 px-3 py-1">${escape(p.category)}</span>` : ''}
            ${p.language ? `<span class="text-[10px] font-code uppercase tracking-wider text-on-surface/50 border border-outline/40 px-3 py-1">${escape(p.language)}</span>` : ''}
          </div>
          ${href !== '#' ? `<a href="${href}" rel="noopener" target="_blank" aria-label="View on GitHub" class="text-primary group-hover:translate-x-1 transition-transform"><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>` : ''}
        </div>
      </li>
    `;
    }).join('');
  }

  // ---------- Publications: left-year list ----------
  function renderPublications(items) {
    const list = document.getElementById('publications-list');
    if (!list) return;
    list.innerHTML = items.map((p) => `
      <li class="flex gap-10 group">
        <div class="hidden md:block pt-1 text-primary font-code text-xs tracking-widest uppercase w-16 shrink-0">${escape(p.year)}</div>
        <div class="flex-grow p-8 border-l border-primary/30 group-hover:border-primary transition-all">
          <h3 class="font-headline text-xl font-bold text-on-surface mb-2">${p.doi ? `<a href="${escape(p.doi)}" rel="noopener" target="_blank">${escape(p.title)}</a>` : escape(p.title)}</h3>
          ${p.authors ? `<p class="text-on-surface/50 text-sm mb-1">${escape(p.authors)}</p>` : ''}
          <p class="text-on-surface/50 text-sm mb-4"><em>${escape(p.venue)}</em></p>
          ${p.doi ? `<div class="flex gap-6 font-code text-[10px] tracking-widest uppercase text-primary">
            <a href="${escape(p.doi)}" rel="noopener" target="_blank" class="hover:underline flex items-center gap-2"><i class="fa-solid fa-arrow-up-right-from-square text-xs" aria-hidden="true"></i> DOI</a>
          </div>` : ''}
        </div>
      </li>
    `).join('');
  }

  // ---------- Patents: left-year list ----------
  function renderPatents(items) {
    const list = document.getElementById('patents-list');
    if (!list) return;
    list.innerHTML = items.map((p) => {
      const filing = (p.filedWith || p.filedOn)
        ? `${p.filedWith ? escape(p.filedWith) : ''}${p.filedWith && p.filedOn ? ' · ' : ''}${p.filedOn ? escape(p.filedOn) : ''}`
        : '';
      return `
      <li class="flex gap-10 group">
        <div class="hidden md:block pt-1 text-primary font-code text-xs tracking-widest uppercase w-16 shrink-0">${escape(p.year)}</div>
        <div class="flex-grow p-8 border-l border-primary/30 group-hover:border-primary transition-all">
          <div class="flex flex-wrap items-center gap-3 mb-2">
            <h3 class="font-headline text-xl font-bold text-on-surface">${escape(p.title)}</h3>
            ${p.status ? `<span class="text-[10px] font-code uppercase tracking-widest text-primary border border-primary/30 px-2 py-1">${escape(p.status)}</span>` : ''}
          </div>
          ${p.number ? `<p class="text-on-surface/50 text-sm mb-1 font-code">${escape(p.number)}</p>` : ''}
          ${filing ? `<p class="text-on-surface/40 text-xs">${filing}</p>` : ''}
        </div>
      </li>
    `;
    }).join('');
  }

  // ---------- Education: glass cards ----------
  function renderEducation(items) {
    const list = document.getElementById('education-list');
    if (!list) return;
    list.innerHTML = items.map((e) => `
      <li class="glass-panel p-8 neon-border">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="font-headline text-xl font-bold text-on-surface">${escape(e.degree)}</h3>
            <p class="text-primary font-code text-xs mt-1 uppercase tracking-wider">${escape(e.school)}</p>
          </div>
          <span class="text-on-surface/40 font-code text-xs">${escape(e.period)}</span>
        </div>
        ${e.note ? `<p class="text-on-surface/60 text-sm leading-relaxed">${escape(e.note)}</p>` : ''}
      </li>
    `).join('');
  }

  // ---------- Spoken languages: bars ----------
  const FLAGS = {
    'pt-BR': '🇧🇷',
    'es-CO': '🇨🇴',
    'en':    '🇬🇧',
    'fr':    '🇫🇷'
  };

  function renderSpoken(items) {
    const list = document.getElementById('spoken-list');
    if (!list) return;
    list.innerHTML = items.map((l) => `
      <li>
        <div class="flex justify-between mb-3">
          <span class="flex items-center gap-3 font-bold text-xs uppercase tracking-widest text-on-surface">
            <span class="text-base" aria-hidden="true">${FLAGS[l.code] || '🏳'}</span> ${escape(l.name)}
            <span class="text-on-surface/40 font-normal">${escape(l.levelLabel || l.level || '')}</span>
          </span>
          <span class="text-primary font-code text-xs">${escape(l.cefr || '')}</span>
        </div>
        <div class="h-[2px] bg-primary/10">
          <div class="h-full bg-primary shadow-[0_0_10px_var(--fx-shadow)]" style="width:${l.percent}%"></div>
        </div>
      </li>
    `).join('');
  }

  // ---------- Programming: stack chips ----------
  function renderProgramming(items) {
    const list = document.getElementById('programming-list');
    if (!list) return;
    list.innerHTML = items.map((p) => {
      const meta = [p.level, p.years ? `${p.years} yr` : ''].filter(Boolean).join(' · ');
      return `
      <li class="border border-primary/20 px-5 py-3 font-code text-xs tracking-widest uppercase hover:border-primary/60 hover:bg-primary/5 transition-all cursor-default"
          title="${escape(meta)}">${escape(p.name)}</li>
    `;
    }).join('');
  }

  let currentLang = DEFAULT_LANG;

  function detectInitialLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('pt')) return 'pt-BR';
    if (nav.startsWith('es')) return 'es-CO';
    return DEFAULT_LANG;
  }

  async function setLanguage(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    try {
      const bundle = await loadBundle(lang);
      currentLang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      applyTranslations(bundle);
      const sel = document.getElementById('lang-select');
      if (sel && sel.value !== lang) sel.value = lang;
    } catch (err) {
      console.error(err);
    }
  }

  function init() {
    const sel = document.getElementById('lang-select');
    const initial = detectInitialLang();
    sel.value = initial;
    setLanguage(initial);
    sel.addEventListener('change', (e) => setLanguage(e.target.value));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.__cvI18n = { setLanguage, get current() { return currentLang; }, SUPPORTED };
})();

