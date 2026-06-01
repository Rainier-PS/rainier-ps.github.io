'use strict';

const SORT_OPTIONS = [
    { value: 'default',   label: 'Default' },
    { value: 'date-desc', label: 'Newest' },
    { value: 'date-asc',  label: 'Oldest' },
    { value: 'az',        label: 'A–Z' },
    { value: 'za',        label: 'Z–A' },
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

document.addEventListener('DOMContentLoaded', () => {
    loadAwards();
});

async function loadAwards() {
    const grid = document.getElementById('awards-grid');
    if (!grid) return;

    try {
        let res;
        try {
            res = await fetch('data/awards.json');
            if (!res.ok) throw new Error('Local fetch failed');
        } catch (e) {
            console.warn('Local fetch failed, trying remote...', e);
            res = await fetch('https://raw.githubusercontent.com/Rainier-PS/rainier-ps.github.io/main/data/awards.json');
        }

        if (!res.ok) throw new Error('Failed to load awards');
        const raw = await res.json();

        const awards = raw.map(a => ({ ...a, _date: parseDateMs(a.date) }));

        const sortSelect = initSortUI('sort-bar', key => {
            renderGrid(grid, sortData(awards, key));
        });

        renderGrid(grid, sortData(awards, sortSelect.value));

    } catch (err) {
        console.error('Award loading error:', err);
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">Unable to load awards at this time.</p>';
    }
}

function renderGrid(grid, data) {
    grid.innerHTML = '';
    const frag = document.createDocumentFragment();
    data.forEach(a => frag.appendChild(renderAwardCard(a)));
    grid.appendChild(frag);
    initLightbox();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
}

function renderAwardCard(award) {
    const card = document.createElement('div');
    card.className = `award-card ${!award.image ? 'no-image' : ''}`;

    const dateLabel = formatDate(award.date);
    const dateHtml = dateLabel
        ? `<span class="proj-date" aria-label="Awarded ${dateLabel}">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
               <span class="proj-date-tooltip">${dateLabel}</span>
           </span>`
        : '';

    card.innerHTML = `
        ${award.image ? `<img src="${award.image}" alt="${award.title}" loading="lazy" decoding="async" data-date="${dateLabel}">` : ''}
        <div class="award-card-body">
            <div class="proj-card-header">
                <h3>${award.title}</h3>
                ${dateHtml}
            </div>
            <p>${award.description || ''}</p>
        </div>
    `;
    return card;
}

function initLightbox() {
    const lightbox    = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn    = document.getElementById('closeLightbox');
    const openBtn     = document.getElementById('openInNewTab');

    if (!lightbox || !lightboxImg) return;

    document.querySelectorAll('.award-card img').forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            const date = img.dataset.date;
            const dateBadge = lightbox.querySelector('.lightbox-date');
            if (dateBadge) dateBadge.textContent = date || '';
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    const close = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    if (openBtn) openBtn.addEventListener('click', () => {
        if (lightboxImg.src) window.open(lightboxImg.src, '_blank');
    });
}
