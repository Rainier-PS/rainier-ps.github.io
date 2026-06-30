'use strict';
document.addEventListener('DOMContentLoaded', () => {
  initContentPage({
    gridId: 'awards-grid',
    sortBarId: 'sort-bar',
    dataUrl: 'data/awards.json',
    fallbackUrl: 'https://raw.githubusercontent.com/Rainier-PS/rainier-ps.github.io/main/data/awards.json',
    errorPrefix: 'Award loading error',
    errorMessage: 'Unable to load awards at this time.',
    renderFn: renderAwardCard,
    afterRender: () => bindLightboxImages('.award-card img')
  });
});

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
