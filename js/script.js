'use strict';

function readStoredMotion() {
  try { return localStorage.getItem('motion'); } catch { return null; }
}

const prefersReducedMotion = readStoredMotion() === 'off';
document.documentElement.dataset.motion = prefersReducedMotion ? 'off' : 'on';

const RESUME_PDF = '';

function initResumeCard() {
  if (!RESUME_PDF) return;
  const heroResume = document.getElementById('heroResume');
  if (heroResume) {
    heroResume.href = RESUME_PDF;
    heroResume.setAttribute('download', '');
    heroResume.classList.remove('btn-disabled');
    heroResume.removeAttribute('title');
    const heroSpan = heroResume.querySelector('span');
    if (heroSpan) heroSpan.textContent = 'Resume';
  }
  const link = document.getElementById('resumeLink');
  if (link) {
    link.href = RESUME_PDF;
    link.setAttribute('download', '');
    link.dataset.state = 'ready';
    const label = link.querySelector('.contact-card-label');
    if (label) label.textContent = 'Resume';
  }
}

initResumeCard();

if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
  document.documentElement.classList.add('no-anim');
  const fallbackSubtitle = document.getElementById('heroSubtitle');
  if (fallbackSubtitle) {
    fallbackSubtitle.textContent = 'Aspiring Engineer · Tech Enthusiast';
    fallbackSubtitle.style.borderRight = 'none';
    fallbackSubtitle.style.animation = 'none';
  }
  throw new Error('animation libraries unavailable');
}

const DEMO_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
const GITHUB_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>';

const MARQUEE_WORDS = [
  'Engineering', 'Python', '3D Printing', 'Arduino', 'JavaScript',
  'PCB Design', 'Robotics', 'STEM', 'Hack Club', 'KiCad', 'Fusion 360'
];

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ overwrite: 'auto' });
ScrollTrigger.config({ ignoreMobileResize: true, autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' });

function refreshLayout() {
  layoutGen++;
  if (window.ScrollTrigger) ScrollTrigger.refresh();
  updateSectionTops();
}

let layoutGen = 0;

function readStoredTheme() {
  try { return localStorage.getItem('theme'); } catch { return null; }
}

function storeTheme(theme) {
  try { localStorage.setItem('theme', theme); } catch { }
}

function storeMotion(value) {
  try { localStorage.setItem('motion', value); } catch { }
}

const $html = document.documentElement;
const $themeToggle = document.getElementById('themeToggle');
const savedTheme = readStoredTheme() || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
$html.setAttribute('data-theme', savedTheme);

$themeToggle.addEventListener('click', (e) => {
  const next = $html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  if (!document.startViewTransition || prefersReducedMotion) {
    $html.setAttribute('data-theme', next);
    storeTheme(next);
    return;
  }
  const x = e.clientX || window.innerWidth / 2;
  const y = e.clientY || 40;
  const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const transition = document.startViewTransition(() => {
    $html.setAttribute('data-theme', next);
    storeTheme(next);
  });
  transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(0.4,0,0.2,1)', pseudoElement: '::view-transition-new(root)' }
    );
  });
});

const $motionToggle = document.getElementById('motionToggle');
if ($motionToggle) {
  $motionToggle.setAttribute('aria-pressed', String(!prefersReducedMotion));
  $motionToggle.addEventListener('click', () => {
    storeMotion(prefersReducedMotion ? 'on' : 'off');
    location.reload();
  });
}

function applyMotionLive(value) {
  const off = value === 'off';
  document.documentElement.dataset.motion = off ? 'off' : 'on';
  if ($motionToggle) $motionToggle.setAttribute('aria-pressed', String(!off));
  const tracks = [document.getElementById('marqueeA'), document.getElementById('marqueeB')].filter(Boolean);
  if (off) {
    gsap.killTweensOf(tracks);
    if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(t => t.kill());
    gsap.set('.reveal, .stagger > *, .char, #heroLabel, #heroTitle, #heroSubWrap, #heroBody, #heroLinks, .hero-avatar-col', { opacity: 1, y: 0, scale: 1, rotationX: 0 });
    gsap.set('.gradient-orb', { x: 0, y: 0 });
    if (typeof taglineEl !== 'undefined' && taglineEl && taglineIndex < taglineText.length) {
      taglineEl.textContent = taglineText;
      taglineEl.style.borderRight = 'none';
      taglineEl.style.animation = 'none';
    }
  } else if (tracks.length && tracks[0].querySelector('.marquee-item')) {
    initMarquee();
  }
  updateSettingsOverlay();
}

window.addEventListener('storage', e => {
  if (!e.key || !e.newValue) return;
  if (e.key === 'motion') {
    applyMotionLive(e.newValue === 'off' ? 'off' : 'on');
  } else if (e.key === 'theme') {
    $html.setAttribute('data-theme', e.newValue);
    updateSettingsOverlay();
  } else if (e.key === 'cursor') {
    applyCursorPref(e.newValue);
    updateSettingsOverlay();
  }
});

const $cursor = document.getElementById('cursor');
const $ring = document.getElementById('cursor-ring');
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (!isTouchDevice && !prefersReducedMotion && $cursor && $ring) {
  let mx = -200, my = -200, rx = -200, ry = -200, cursorRunning = false;
  gsap.set([$cursor, $ring], { xPercent: -50, yPercent: -50 });
  const cursorTick = () => {
    if (!document.body.classList.contains('custom-cursor-enabled') || document.documentElement.dataset.motion === 'off') {
      cursorRunning = false;
      return;
    }
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    gsap.set($cursor, { x: mx, y: my });
    gsap.set($ring, { x: rx, y: ry });
    requestAnimationFrame(cursorTick);
  };
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (!cursorRunning && document.body.classList.contains('custom-cursor-enabled') && document.documentElement.dataset.motion !== 'off') {
      cursorRunning = true;
      requestAnimationFrame(cursorTick);
    }
  }, { passive: true });
}

const $nav = document.getElementById('navbar');
const $menuBtn = document.getElementById('menuBtn');
let ticking = false;

function updateNavScrolled() {
  const isMobileNav = window.innerWidth <= 768;
  $nav.classList.toggle('scrolled', !isMobileNav && window.scrollY > 60);
  $nav.dataset.mobile = isMobileNav ? 'true' : 'false';
}

const navSections = document.querySelectorAll('section[id]');
const navAs = document.querySelectorAll('.nav-links a');
let sectionTops = [];

function updateSectionTops() {
  sectionTops = Array.from(navSections).map(s => ({ id: s.id, top: s.offsetTop }));
}

function activateNavLink() {
  const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || !window.location.pathname.includes('.html');
  if (!isHomePage) return;
  let current = '';
  const scrollY = window.scrollY;
  sectionTops.forEach(s => { if (scrollY >= s.top - 140) current = s.id; });
  navAs.forEach(a => { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
}

function updateScrollbar() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  document.documentElement.style.setProperty('--sb-stop', (scrolled * 100) + '%');
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => { updateNavScrolled(); activateNavLink(); updateScrollbar(); ticking = false; });
    ticking = true;
  }
}, { passive: true });

let resizeSectionTimer = null;
window.addEventListener('resize', () => {
  requestAnimationFrame(updateNavScrolled);
  clearTimeout(resizeSectionTimer);
  resizeSectionTimer = setTimeout(updateSectionTops, 120);
}, { passive: true });
window.addEventListener('load', () => { updateSectionTops(); updateNavScrolled(); activateNavLink(); updateScrollbar(); });
updateNavScrolled();

$menuBtn.addEventListener('click', () => {
  const open = $nav.classList.toggle('menu-open');
  $menuBtn.setAttribute('aria-expanded', String(open));
});
document.addEventListener('click', (e) => {
  if ($nav.classList.contains('menu-open') && !e.target.closest('#navbar')) {
    $nav.classList.remove('menu-open');
    $menuBtn.setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && $nav.classList.contains('menu-open')) {
    $nav.classList.remove('menu-open');
    $menuBtn.setAttribute('aria-expanded', 'false');
  }
});
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => {
  $nav.classList.remove('menu-open');
  $menuBtn.setAttribute('aria-expanded', 'false');
}));

const emailLink = document.getElementById('email-link');
if (emailLink) {
  const decode = (arr, key) => arr.map(n => String.fromCharCode(n ^ key)).join('');
  const key = 117;
  const chunks = [
    decode([7, 20, 28, 27, 28, 16, 7], key),
    decode([5, 6, 77], key),
    decode([53], key),
    decode([18, 24, 20, 28, 25, 91, 22, 26, 24], key),
  ];
  const buildMailto = () => 'mailto:' + chunks.join('');
  const inject = () => { emailLink.href = buildMailto(); };
  emailLink.addEventListener('mouseenter', inject, { once: true });
  emailLink.addEventListener('focus', inject, { once: true });
  emailLink.addEventListener('click', (e) => {
    if (!emailLink.getAttribute('href')) {
      e.preventDefault();
      inject();
      window.location.href = emailLink.href;
    }
  });
}

function initCopyrightYear() {
  const el = document.getElementById('copyright-year');
  if (!el) return;
  const start = 2025, cur = new Date().getFullYear();
  el.textContent = start === cur ? start : `${start}–${cur}`;
}
initCopyrightYear();

const taglineText = 'Aspiring Engineer · Tech Enthusiast';
let taglineIndex = 0;
const taglineEl = document.getElementById('heroSubtitle');

function typeTagline() {
  if (!taglineEl) return;
  taglineEl.textContent = '';
  taglineIndex = 0;
  function type() {
    if (document.documentElement.dataset.motion === 'off') {
      taglineEl.textContent = taglineText;
      taglineEl.style.borderRight = 'none';
      taglineEl.style.animation = 'none';
      return;
    }
    if (taglineIndex < taglineText.length) {
      taglineEl.textContent += taglineText.charAt(taglineIndex++);
      setTimeout(type, 55);
    } else {
      taglineEl.style.borderRight = 'none';
      taglineEl.style.animation = 'none';
    }
  }
  type();
}

if (prefersReducedMotion) {
  gsap.set(['#heroLabel', '#heroTitle', '#heroSubWrap', '#heroBody', '#heroLinks', '.hero-avatar-col'], { opacity: 1, y: 0 });
  if (taglineEl) {
    taglineEl.textContent = taglineText;
    taglineEl.style.borderRight = 'none';
    taglineEl.style.animation = 'none';
  }
} else {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });
  tl.to('#heroLabel',    { opacity: 1, y: 0, duration: 0.65 })
    .to('#heroTitle',    { opacity: 1, y: 0, duration: 0.8 }, '-=0.35')
    .to('#heroSubWrap',  { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
    .to('#heroBody',     { opacity: 1, y: 0, duration: 0.7 }, '-=0.45')
    .to('#heroLinks',    { opacity: 1, y: 0, duration: 0.7 }, '-=0.45')
    .to('.hero-avatar-col', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6');
  tl.call(typeTagline, [], 1.2);
}

const orbs = document.querySelectorAll('.gradient-orb');
if (!isTouchDevice && !prefersReducedMotion) {
  const orbSetters = [...orbs].map(orb => ({
    xTo: gsap.quickTo(orb, 'x', { duration: 0.6, ease: 'power2.out' }),
    yTo: gsap.quickTo(orb, 'y', { duration: 0.6, ease: 'power2.out' }),
  }));
  document.addEventListener('mousemove', e => {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    orbSetters.forEach((s, i) => { const spd = (i + 1) * 22; s.xTo(x * spd); s.yTo(y * spd); });
  }, { passive: true });
}

if (!prefersReducedMotion) {
  gsap.utils.toArray('.gradient-orb').forEach((orb, i) => {
    gsap.to(orb, {
      y: i % 2 === 0 ? 160 : -160,
      scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1 }
    });
  });
}

function buildMarquee(id) {
  const track = document.getElementById(id);
  if (!track) return;
  const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS];
  words.forEach(word => {
    const item = document.createElement('span');
    item.className = 'marquee-item';
    item.innerHTML = word + '<span class="marquee-dot"></span>';
    track.appendChild(item);
  });
}
buildMarquee('marqueeA');
buildMarquee('marqueeB');

function initMarquee() {
  const tA = document.getElementById('marqueeA');
  const tB = document.getElementById('marqueeB');
  if (!tA || !tB) return;
  if (!tA.querySelector('.marquee-item')) return;
  gsap.killTweensOf([tA, tB]);
  const singleSetWidth = tA.offsetWidth / 3;
  if (!singleSetWidth) return;
  gsap.set(tA, { x: 0 });
  gsap.set(tB, { x: singleSetWidth });
  const dur = singleSetWidth / 70;
  function animTrack(el, startX) {
    gsap.fromTo(el, { x: startX }, {
      x: startX - singleSetWidth, duration: dur, ease: 'none', repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(val => {
          let v = parseFloat(val) % singleSetWidth;
          if (v > 0) v -= singleSetWidth;
          return v;
        })
      }
    });
  }
  animTrack(tA, 0);
  animTrack(tB, singleSetWidth);
}
if (!prefersReducedMotion) {
  window.addEventListener('load', () => setTimeout(initMarquee, 80));
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    refreshLayout();
    if (!prefersReducedMotion) initMarquee();
  });
}

function splitTextToSpans(selector) {
  document.querySelectorAll(selector).forEach(el => {
    const text = el.innerText;
    el.innerHTML = '';
    text.split('').forEach(char => {
      if (char === '\n') { el.appendChild(document.createElement('br')); return; }
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      el.appendChild(span);
    });
  });
}

if (!prefersReducedMotion) {
  splitTextToSpans('.section-title');

  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.fromTo(title.querySelectorAll('.char'),
      { y: 50, opacity: 0, scale: 0.7, rotationX: -70 },
      {
        y: 0, opacity: 1, scale: 1, rotationX: 0, stagger: 0.035, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: title, start: 'top 90%', end: 'top 60%', scrub: 0.8 }
      });
  });
}

if (prefersReducedMotion) {
  gsap.set('.reveal, .stagger > *', { opacity: 1, y: 0 });
} else {
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.fromTo(el, 
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true
        }
      }
    );
  });

  gsap.utils.toArray('.stagger').forEach(container => {
    const children = Array.from(container.children).filter(child => !child.classList.contains('reveal'));
    if (children.length === 0) return;
    gsap.fromTo(children,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true
        }
      }
    );
  });
}

const SORT_OPTIONS = [
  { value: 'default',   label: 'Default' },
  { value: 'date-desc', label: 'Newest' },
  { value: 'date-asc',  label: 'Oldest' },
  { value: 'az',        label: 'A\u2013Z' },
  { value: 'za',        label: 'Z\u2013A' },
];

const SORTERS = {
  'default':   () => 0,
  'date-desc': (a, b) => b._date - a._date,
  'date-asc':  (a, b) => a._date - b._date,
  'az':        (a, b) => a.title.localeCompare(b.title),
  'za':        (a, b) => b.title.localeCompare(a.title),
};

function parseDateMs(str) {
  return str ? new Date(str).getTime() : 0;
}

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function initSortUI(sortBarId, onSort) {
  const bar = document.getElementById(sortBarId);
  if (!bar) return { value: 'default' };

  bar.innerHTML = '';

  const label = document.createElement('span');
  label.className = 'sort-label';
  label.textContent = 'Sort by';

  const select = document.createElement('select');
  select.className = 'sort-select';
  select.setAttribute('aria-label', 'Sort order');

  SORT_OPTIONS.forEach(opt => {
    const el = document.createElement('option');
    el.value = opt.value;
    el.textContent = opt.label;
    select.appendChild(el);
  });

  select.addEventListener('change', () => onSort(select.value));

  bar.appendChild(label);
  bar.appendChild(select);

  return select;
}

function sortData(data, key) {
  return [...data].sort(SORTERS[key] || SORTERS['date-desc']);
}

async function initContentPage(config) {
  const grid = document.getElementById(config.gridId);
  if (!grid) return;

  try {
    let res;
    try {
      res = await fetch(config.dataUrl);
      if (!res.ok) throw new Error();
    } catch {
      res = await fetch(config.fallbackUrl);
    }
    if (!res.ok) throw new Error('Failed');

    const raw = await res.json();
    const items = raw.map(item => ({ ...item, _date: parseDateMs(item.date) }));

    const sortSelect = initSortUI(config.sortBarId, key => renderContentGrid(grid, items, key, config));
    renderContentGrid(grid, items, sortSelect.value, config);
  } catch (err) {
    console.error(config.errorPrefix + ':', err);
    grid.innerHTML = `<p class="load-error">${config.errorMessage}</p>`;
  }
}

function renderContentGrid(grid, items, sortKey, config) {
  const sorted = sortData(items, sortKey);
  grid.innerHTML = '';
  const frag = document.createDocumentFragment();
  sorted.forEach(item => frag.appendChild(config.renderFn(item)));
  grid.appendChild(frag);
  if (config.afterRender) config.afterRender();
  refreshLayout();
}

const DATA = { projects: [], awards: [] };
const projectData = {};

async function loadJSON(localUrl, remoteUrl) {
  try {
    const res = await fetch(localUrl);
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch {
    try {
      const res = await fetch(remoteUrl);
      if (!res.ok) throw new Error('Failed');
      return await res.json();
    } catch { return []; }
  }
}

function loadProjectsFromJSON() {
  return loadJSON('data/projects.json', 'https://raw.githubusercontent.com/Rainier-PS/rainier-ps.github.io/main/data/projects.json');
}

function loadAwardsFromJSON() {
  return loadJSON('data/awards.json', 'https://raw.githubusercontent.com/Rainier-PS/rainier-ps.github.io/main/data/awards.json');
}

function getPerPage() {
  return window.innerWidth <= 768 ? 1 : 3;
}

function renderCarousel({ containerId, items, perPage }) {
  const track = document.getElementById(containerId);
  if (!track) return;
  track.innerHTML = '';
  if (!items || !items.length) return;

  for (let i = 0; i < items.length; i += perPage) {
    const page = document.createElement('div');
    page.className = 'carousel-cards';
    page.style.gridTemplateColumns = `repeat(${perPage}, 1fr)`;
    page.style.minWidth = '100%';

    items.slice(i, i + perPage).forEach(item => {
      const card = document.createElement('div');
      card.className = 'proj-card';
      card.innerHTML = `
        ${item.image ? `<img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async">` : ''}
        <div class="proj-card-body">
          <h3>${item.title}</h3>
          <p>${item.description || ''}</p>
          ${item.labels?.length ? `<div class="proj-labels">${item.labels.map(l => `<span class="proj-label">${l}</span>`).join('')}</div>` : ''}
          ${item.demo || item.github ? `
            <div class="proj-buttons">
              ${item.demo ? `<a href="${item.demo}" class="proj-btn" target="_blank" rel="noopener">
                <span>Demo</span>
                ${DEMO_ICON}
              </a>` : ''}
              ${item.github ? `<a href="${item.github}" class="proj-btn" target="_blank" rel="noopener">
                <span>GitHub</span>
                ${GITHUB_ICON}
              </a>` : ''}
            </div>` : ''}
        </div>`;
      page.appendChild(card);
    });
    track.appendChild(page);
  }
}

const pageOffsetCache = new WeakMap();

function pageOffset(carousel, index) {
  const track = carousel.querySelector('.carousel-track');
  const pages = track ? track.children : [];
  if (!pages.length) return 0;
  let entry = pageOffsetCache.get(carousel);
  if (!entry || entry.gen !== layoutGen) {
    const base = pages[0].offsetLeft;
    entry = { gen: layoutGen, offsets: Array.from(pages).map(p => p.offsetLeft - base) };
    pageOffsetCache.set(carousel, entry);
  }
  const clamped = Math.max(0, Math.min(index, entry.offsets.length - 1));
  return entry.offsets[clamped];
}

function setCarouselSlide(carousel, index) {
  const track = carousel.querySelector('.carousel-track');
  const dotsContainer = carousel.querySelector('.carousel-dots');
  if (!track || !dotsContainer) return;

  const pages = Array.from(track.children);
  const N = pages.length;
  if (N === 0) return;

  const clamped = Math.max(0, Math.min(index, N - 1));
  track.style.transform = `translateX(-${pageOffset(carousel, clamped)}px)`;
  carousel.dataset.activeIndex = clamped;

  const isMobile = window.innerWidth <= 768;
  const maxDots = isMobile ? 3 : 5;
  const K = Math.min(maxDots, N);

  let S = 0;
  let activeDotIndex = clamped;

  if (N > maxDots) {
    const half = Math.floor(K / 2);
    if (clamped < half) {
      S = 0;
      activeDotIndex = clamped;
    } else if (clamped >= N - half) {
      S = N - K;
      activeDotIndex = clamped - S;
    } else {
      activeDotIndex = half;
      S = clamped - activeDotIndex;
    }
  }

  dotsContainer.innerHTML = '';
  for (let i = 0; i < K; i++) {
    const pageIndex = S + i;
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Go to slide ${pageIndex + 1}`);
    if (i === activeDotIndex) {
      dot.classList.add('active');
    }
    dot.addEventListener('click', () => setCarouselSlide(carousel, pageIndex));
    dotsContainer.appendChild(dot);
  }
}

function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const activeIndex = parseInt(carousel.dataset.activeIndex, 10) || 0;
    setCarouselSlide(carousel, activeIndex);
    addSwipeSupport(carousel);
    addKeyboardSupport(carousel);
  });
}

function addKeyboardSupport(carousel) {
  if (carousel.dataset.keyboardBound === 'true') return;
  carousel.dataset.keyboardBound = 'true';
  carousel.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.target.closest('input, textarea, select')) return;
    e.preventDefault();
    const activeIndex = parseInt(carousel.dataset.activeIndex, 10) || 0;
    setCarouselSlide(carousel, activeIndex + (e.key === 'ArrowRight' ? 1 : -1));
  });
}

function addSwipeSupport(carousel) {
  if (carousel.dataset.swipeBound === 'true') return;
  carousel.dataset.swipeBound = 'true';
  const track = carousel.querySelector('.carousel-track');
  if (!track) return;

  let startX = 0;
  let startY = 0;
  let isSwiping = false;
  let isScrollAction = false;
  let diffX = 0;
  let dragOccurred = false;

  const getPos = e => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const onStart = e => {
    if (e.type === 'mousedown' && e.button !== 0) return;
    const pos = getPos(e);
    startX = pos.x;
    startY = pos.y;
    isSwiping = true;
    isScrollAction = false;
    diffX = 0;
    dragOccurred = false;
    track.style.transition = 'none';
    if (e.type === 'mousedown') {
      track.style.cursor = 'grabbing';
    }
  };

  const onMove = e => {
    if (!isSwiping || isScrollAction) return;

    const pos = getPos(e);
    diffX = pos.x - startX;
    const diffY = pos.y - startY;

    if (e.touches) {
      if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 10) {
        isScrollAction = true;
        isSwiping = false;
        carousel.classList.remove('dragging');
        track.style.transition = '';
        track.style.transform = `translateX(-${pageOffset(carousel, parseInt(carousel.dataset.activeIndex, 10) || 0)}px)`;
        return;
      }
    }

    if (Math.abs(diffX) > 10) {
      dragOccurred = true;
      carousel.classList.add('dragging');
      if (e.cancelable) {
        e.preventDefault();
      }
      const activeIndex = parseInt(carousel.dataset.activeIndex, 10) || 0;
      track.style.transform = `translateX(${diffX - pageOffset(carousel, activeIndex)}px)`;
    }
  };

  const onEnd = e => {
    carousel.classList.remove('dragging');
    if (!isSwiping) return;
    isSwiping = false;
    track.style.cursor = '';

    track.style.transition = '';
    const activeIndex = parseInt(carousel.dataset.activeIndex, 10) || 0;
    const width = carousel.offsetWidth;
    const threshold = width * 0.15;

    let targetIndex = activeIndex;
    if (diffX < -threshold) {
      targetIndex = activeIndex + 1;
    } else if (diffX > threshold) {
      targetIndex = activeIndex - 1;
    }

    setCarouselSlide(carousel, targetIndex);
  };

  track.addEventListener('touchstart', onStart, { passive: true });
  track.addEventListener('touchmove', onMove, { passive: false });
  track.addEventListener('touchend', onEnd);

  track.addEventListener('mousedown', e => {
    if (e.button !== 0 || e.target.closest('a, button')) return;
    e.preventDefault();
  });
  track.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);

  track.addEventListener('dragstart', e => {
    e.preventDefault();
  });

  track.addEventListener('click', e => {
    if (dragOccurred) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
}

document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();

  const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || !window.location.pathname.includes('.html');
  let renderedPerPage = 0;

  if (isHomePage) {
    const [projects, awardsData] = await Promise.all([loadProjectsFromJSON(), loadAwardsFromJSON()]);

    if (projects.length > 0) {
      DATA.projects = projects;
      projects.forEach(p => { projectData[p.slug] = { title: p.title, desc: p.description }; });
    }
    const rawAwards = Array.isArray(awardsData) ? awardsData : (awardsData.awards || awardsData.data || []);
    if (rawAwards.length > 0) {
      DATA.awards = rawAwards.map(item => ({
        title: item.title || item.award || item.name || 'Untitled Award',
        description: item.description || item.desc || item.details || item.date || '',
        image: item.image || item.logo || null,
        labels: item.labels || [],
        ...item
      }));
    }

    const projectsGrid = document.getElementById('projects-grid');
    const awardsGrid = document.getElementById('awards-grid');
    if (projectsGrid && DATA.projects.length > 0) renderCarousel({ containerId: 'projects-grid', items: DATA.projects, perPage: getPerPage() });
    if (awardsGrid && DATA.awards.length > 0) renderCarousel({ containerId: 'awards-grid', items: DATA.awards, perPage: getPerPage() });
    renderedPerPage = getPerPage();

    initCarousels();
    bindLightboxImages();
  }

  refreshLayout();

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (isHomePage) {
        const perPage = getPerPage();
        if (perPage !== renderedPerPage) {
          renderedPerPage = perPage;
          const projectsGrid = document.getElementById('projects-grid');
          const awardsGrid = document.getElementById('awards-grid');
          if (projectsGrid && DATA.projects.length > 0) renderCarousel({ containerId: 'projects-grid', items: DATA.projects, perPage });
          if (awardsGrid && DATA.awards.length > 0) renderCarousel({ containerId: 'awards-grid', items: DATA.awards, perPage });
          bindLightboxImages();
        }
        initCarousels();
      }
      refreshLayout();
    }, 150);
  }, { passive: true });
});

const lightbox = document.getElementById('imageLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const closeBtn = document.getElementById('closeLightbox');
const openBtn = document.getElementById('openInNewTab');
let lastFocusedBeforeLightbox = null;

function bindLightboxImages(selector) {
  const sel = selector || '#projects .proj-card img, #awards .proj-card img';
  document.querySelectorAll(sel).forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lastFocusedBeforeLightbox = document.activeElement;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      closeBtn?.focus();
    });
  });
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  if (lastFocusedBeforeLightbox) {
    lastFocusedBeforeLightbox.focus();
    lastFocusedBeforeLightbox = null;
  }
}

const lightboxFocusable = closeBtn && openBtn ? [closeBtn, openBtn] : [];

closeBtn?.addEventListener('click', closeLightbox);
openBtn?.addEventListener('click', () => { if (lightboxImg.src) window.open(lightboxImg.src, '_blank', 'noopener'); });
lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if ((e.key === 'Escape' || e.key === 'Esc') && lightbox?.classList.contains('active')) closeLightbox();
  if (e.key === 'Tab' && lightbox?.classList.contains('active') && lightboxFocusable.length) {
    const first = lightboxFocusable[0];
    const last = lightboxFocusable[lightboxFocusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

const $customScrollbar = document.querySelector('.custom-scrollbar');
let isDragging = false;
if ($customScrollbar) {
  $customScrollbar.addEventListener('mousedown', (e) => {
    if (window.innerWidth <= 768) return;
    isDragging = true;
    document.body.style.userSelect = 'none';
    const onDrag = (e) => {
      if (!isDragging) return;
      const rect = $customScrollbar.getBoundingClientRect();
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
      window.scrollTo(0, (y / rect.height) * (document.documentElement.scrollHeight - window.innerHeight));
    };
    const onStop = () => { isDragging = false; document.body.style.userSelect = ''; document.removeEventListener('mousemove', onDrag); document.removeEventListener('mouseup', onStop); };
    onDrag(e);
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', onStop);
  });
}

function initGitHubGraph() {
  const calendar = document.getElementById('calendar');
  if (!calendar) return;
  const USERNAME = 'Rainier-PS';
  const YEARS = [2026, 2025, 2024];
  const monthsRow = document.getElementById('months');
  const summary = document.getElementById('summary');
  const tooltip = document.getElementById('tooltip');
  const yearSelect = document.getElementById('yearSelect');
  const yearButtons = document.getElementById('yearButtons');
  let activeCell = null;
  let loadSeq = 0;

  if (tooltip && tooltip.parentElement !== document.body) {
    document.body.appendChild(tooltip);
  }

  function getWeekStride() {
    const weeks = calendar.querySelectorAll('.week');
    if (weeks.length < 2) {
      const week = weeks[0];
      return week ? week.getBoundingClientRect().width + 3 : 17;
    }
    const a = weeks[0].getBoundingClientRect().left;
    const b = weeks[1].getBoundingClientRect().left;
    return b - a;
  }

  function positionTooltip(cell) {
    if (!tooltip || !cell) return;
    const rect = cell.getBoundingClientRect();
    const gap = 10;

    tooltip.classList.add('is-visible');
    tooltip.style.visibility = 'hidden';
    const tw = tooltip.offsetWidth || 100;
    const th = tooltip.offsetHeight || 28;
    tooltip.style.visibility = '';

    let left = rect.left + rect.width / 2 - tw / 2;
    let top = rect.top - th - gap;
    if (top < 8) top = rect.bottom + gap;
    left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function hideTooltip() {
    if (!tooltip) return;
    tooltip.classList.remove('is-visible');
    if (activeCell) activeCell.classList.remove('is-tapped');
    activeCell = null;
  }

  function bindDayCell(cell, count, date) {
    const label = `${count} on ${date}`;
    cell.dataset.contrib = '1';
    cell.dataset.label = label;
    cell.setAttribute('aria-label', `${count} contributions on ${date}`);
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('role', 'button');

    const show = () => {
      if (activeCell && activeCell !== cell) activeCell.classList.remove('is-tapped');
      activeCell = cell;
      cell.classList.add('is-tapped');
      tooltip.textContent = label;
      positionTooltip(cell);
    };

    cell.addEventListener('mouseenter', show);
    cell.addEventListener('mouseleave', hideTooltip);
    cell.addEventListener('focus', show);
    cell.addEventListener('blur', hideTooltip);
  }

  function handleMobileTap(cell) {
    const label = cell.dataset.label;
    if (!label) return;
    if (activeCell === cell && tooltip.classList.contains('is-visible')) {
      hideTooltip();
      return;
    }
    if (activeCell && activeCell !== cell) activeCell.classList.remove('is-tapped');
    activeCell = cell;
    cell.classList.add('is-tapped');
    tooltip.textContent = label;
    positionTooltip(cell);
  }

  calendar.addEventListener('touchend', (e) => {
    const cell = e.target.closest('.day[data-contrib]');
    if (!cell) return;
    e.stopPropagation();
    handleMobileTap(cell);
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (e.target.closest('.day[data-contrib]')) return;
    hideTooltip();
  }, { passive: true });

  document.querySelectorAll('.contributions-wrap, .graph-layout').forEach(el => {
    el.addEventListener('scroll', hideTooltip, { passive: true });
  });

  window.addEventListener('scroll', () => {
    if (activeCell && tooltip.classList.contains('is-visible')) positionTooltip(activeCell);
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (activeCell && tooltip.classList.contains('is-visible')) positionTooltip(activeCell);
  }, { passive: true });

  function level(count) {
    if (count >= 8) return 5;
    if (count >= 4) return 4;
    if (count >= 2) return 3;
    if (count >= 1) return 2;
    return 0;
  }

  function buildYearButtons(active) {
    if (!yearButtons) return;
    yearButtons.innerHTML = '';
    YEARS.forEach(y => {
      const btn = document.createElement('button');
      btn.className = 'year-btn' + (y === active ? ' active' : '');
      btn.textContent = y;
      btn.onclick = () => loadYear(y);
      yearButtons.appendChild(btn);
    });
  }

  async function loadYear(year) {
    const seq = ++loadSeq;
    calendar.innerHTML = '';
    monthsRow.innerHTML = '';
    hideTooltip();
    summary.textContent = 'Loading…';
    yearSelect.value = year;
    buildYearButtons(year);
    try {
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=${year}`);
      const data = await res.json();
      if (seq !== loadSeq) return;
      const days = data.contributions;
      summary.textContent = `${data.total[year]} contributions in ${year}`;
      let currentMonth = -1;
      let weekIndex = 0;
      const monthStarts = {};
      let week = document.createElement('div');
      week.className = 'week';
      const firstDay = new Date(days[0].date).getDay();
      for (let i = 0; i < firstDay; i++) week.appendChild(Object.assign(document.createElement('div'), { className: 'day' }));
      days.forEach(d => {
        const date = new Date(d.date);
        const m = date.getMonth();
        if (m !== currentMonth) {
          currentMonth = m;
          if (monthStarts[m] === undefined) {
            monthStarts[m] = weekIndex;
          }
        }
        const cell = document.createElement('div');
        const lvl = level(d.count);
        cell.className = 'day' + (lvl ? ` lvl-${lvl}` : '');
        bindDayCell(cell, d.count, d.date);
        week.appendChild(cell);
        if (date.getDay() === 6) {
          calendar.appendChild(week);
          week = document.createElement('div');
          week.className = 'week';
          weekIndex++;
        }
      });
      while (week.children.length < 7) week.appendChild(Object.assign(document.createElement('div'), { className: 'day' }));
      calendar.appendChild(week);
      Object.entries(monthStarts).forEach(([m, startIndex]) => {
        const label = document.createElement('div');
        label.className = 'month';
        label.style.left = `${startIndex * getWeekStride()}px`;
        label.textContent = new Date(2024, m).toLocaleString('en', { month: 'short' });
        monthsRow.appendChild(label);
      });
      refreshLayout();
    } catch (e) {
      summary.textContent = 'Failed to load contributions.';
    }
  }

  yearSelect.onchange = e => loadYear(+e.target.value);
  loadYear(YEARS[0]);
}

initGitHubGraph();

function readStoredCursor() {
  try { return localStorage.getItem('cursor'); } catch { return null; }
}

function storeCursor(value) {
  try { localStorage.setItem('cursor', value); } catch { }
}

function applyCursorPref(value) {
  const enable = value === 'on' && !isTouchDevice;
  document.body.classList.toggle('custom-cursor-enabled', enable);
}

function updateSettingsOverlay() {
  const overlay = document.getElementById('settingsOverlay');
  if (!overlay) return;
  const motion = document.documentElement.dataset.motion;
  const theme = $html.getAttribute('data-theme');
  const cursor = document.body.classList.contains('custom-cursor-enabled') ? 'on' : 'off';
  overlay.querySelectorAll('[data-motion-choice]').forEach(b => {
    const active = b.dataset.motionChoice === motion;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', String(active));
  });
  overlay.querySelectorAll('[data-theme-choice]').forEach(b => {
    const active = b.dataset.themeChoice === theme;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', String(active));
  });
  overlay.querySelectorAll('[data-cursor-choice]').forEach(b => {
    const active = b.dataset.cursorChoice === cursor;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', String(active));
  });
}

function buildSettingsOverlay() {
  if (document.getElementById('settingsOverlay')) return;
  const wrap = document.createElement('div');
  wrap.className = 'settings-overlay';
  wrap.id = 'settingsOverlay';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-label', 'Settings');
  wrap.hidden = true;
  wrap.innerHTML =
    '<div class="settings-panel">' +
      '<div class="settings-head">' +
        '<h2 class="settings-title">Settings</h2>' +
        '<button class="settings-close" id="settingsClose" aria-label="Close settings">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="settings-group">' +
        '<span class="settings-label" id="setMotionLabel">Animations</span>' +
        '<div class="settings-seg" role="group" aria-labelledby="setMotionLabel">' +
          '<button class="seg-btn" data-motion-choice="on" aria-pressed="false">On</button>' +
          '<button class="seg-btn" data-motion-choice="off" aria-pressed="false">Off</button>' +
        '</div>' +
      '</div>' +
      '<div class="settings-group">' +
        '<span class="settings-label" id="setThemeLabel">Theme</span>' +
        '<div class="settings-seg" role="group" aria-labelledby="setThemeLabel">' +
          '<button class="seg-btn" data-theme-choice="dark" aria-pressed="false">Dark</button>' +
          '<button class="seg-btn" data-theme-choice="light" aria-pressed="false">Light</button>' +
        '</div>' +
      '</div>' +
      '<div class="settings-group">' +
        '<span class="settings-label" id="setCursorLabel">Custom cursor</span>' +
        '<div class="settings-seg" role="group" aria-labelledby="setCursorLabel">' +
          '<button class="seg-btn" data-cursor-choice="on" aria-pressed="false">On</button>' +
          '<button class="seg-btn" data-cursor-choice="off" aria-pressed="false">Off</button>' +
        '</div>' +
      '</div>' +
      '<div class="settings-foot">' +
        '<span class="settings-hint">Shortcut: Ctrl + ,</span>' +
        '<button class="settings-reset" id="settingsReset">Reset to defaults</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(wrap);

  wrap.addEventListener('click', e => {
    const motionChoice = e.target.closest('[data-motion-choice]');
    if (motionChoice) {
      const choice = motionChoice.dataset.motionChoice;
      if (choice !== document.documentElement.dataset.motion) {
        storeMotion(choice);
        location.reload();
      }
      return;
    }
    const themeChoice = e.target.closest('[data-theme-choice]');
    if (themeChoice) {
      const choice = themeChoice.dataset.themeChoice;
      $html.setAttribute('data-theme', choice);
      storeTheme(choice);
      updateSettingsOverlay();
      return;
    }
    const cursorChoice = e.target.closest('[data-cursor-choice]');
    if (cursorChoice) {
      const choice = cursorChoice.dataset.cursorChoice;
      storeCursor(choice);
      applyCursorPref(choice);
      updateSettingsOverlay();
      return;
    }
    if (e.target.closest('#settingsClose') || e.target === wrap) closeSettings();
  });
  const resetBtn = document.getElementById('settingsReset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      let hadPrefs = false;
      try {
        hadPrefs = localStorage.getItem('motion') !== null || localStorage.getItem('theme') !== null || localStorage.getItem('cursor') !== null;
        localStorage.clear();
      } catch { }
      if (hadPrefs) location.reload();
    });
  }
}

let settingsReturnFocus = null;

function openSettings() {
  const overlay = document.getElementById('settingsOverlay');
  if (!overlay) return;
  settingsReturnFocus = document.activeElement;
  overlay.hidden = false;
  updateSettingsOverlay();
  const first = overlay.querySelector('.seg-btn.active') || overlay.querySelector('.settings-close');
  if (first) first.focus();
}

function closeSettings() {
  const overlay = document.getElementById('settingsOverlay');
  if (!overlay || overlay.hidden) return;
  overlay.hidden = true;
  if (settingsReturnFocus && settingsReturnFocus.focus) settingsReturnFocus.focus();
}

document.addEventListener('keydown', e => {
  const overlay = document.getElementById('settingsOverlay');
  if (!overlay) return;
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key === ',') {
    e.preventDefault();
    if (overlay.hidden) openSettings(); else closeSettings();
    return;
  }
  if (overlay.hidden) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    closeSettings();
  } else if (e.key === 'Tab') {
    const focusables = [...overlay.querySelectorAll('button:not([disabled])')];
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

buildSettingsOverlay();
applyCursorPref(readStoredCursor() || 'off');
updateSettingsOverlay();
