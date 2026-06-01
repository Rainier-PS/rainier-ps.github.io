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
    loadPublications();
});

async function loadPublications() {
    const grid = document.getElementById('publications-grid');
    if (!grid) return;

    try {
        let res;
        try {
            res = await fetch('data/publications.json');
            if (!res.ok) throw new Error('Local fetch failed');
        } catch (e) {
            console.warn('Local fetch failed, trying remote...', e);
            res = await fetch('https://raw.githubusercontent.com/Rainier-PS/rainier-ps.github.io/main/data/publications.json');
        }

        if (!res.ok) throw new Error('Failed to load publications');
        const raw = await res.json();

        const publications = raw.map(p => ({ ...p, _date: parseDateMs(p.date) }));

        const sortSelect = initSortUI('sort-bar', key => {
            renderGrid(grid, sortData(publications, key));
        });

        renderGrid(grid, sortData(publications, sortSelect.value));

    } catch (err) {
        console.error('Publication loading error:', err);
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">Unable to load publications at this time.</p>';
    }
}

function renderGrid(grid, data) {
    grid.innerHTML = '';
    const frag = document.createDocumentFragment();
    data.forEach(p => frag.appendChild(renderPubCard(p)));
    grid.appendChild(frag);
    if (window.lucide) lucide.createIcons();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
}

function renderPubCard(pub) {
    const card = document.createElement('div');
    card.className = 'pub-card';

    const tagsHtml = pub.tags && pub.tags.length
        ? `<div class="pub-tags">${pub.tags.map(t => `<span class="pub-tag">${t}</span>`).join('')}</div>`
        : '';

    const dateLabel = formatDate(pub.date);
    const dateHtml = dateLabel
        ? `<span class="proj-date" aria-label="Published ${dateLabel}">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
               <span class="proj-date-tooltip">${dateLabel}</span>
           </span>`
        : '';

    card.innerHTML = `
        <div class="pub-icon-wrapper">
            <i data-lucide="${pub.icon || 'book-open'}"></i>
        </div>
        <div class="proj-card-header">
            <h3>${pub.title}</h3>
            ${dateHtml}
        </div>
        <p>${pub.description}</p>
        ${tagsHtml}
        <a href="${pub.url}" class="pub-btn" target="_blank" rel="noopener">
            <span>Read Article</span>
            <i data-lucide="external-link"></i>
        </a>
    `;
    return card;
}
