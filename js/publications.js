'use strict';

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
