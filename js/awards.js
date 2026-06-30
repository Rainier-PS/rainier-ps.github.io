'use strict';

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
    bindLightboxImages('.award-card img');
}
