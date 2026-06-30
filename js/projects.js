'use strict';
document.addEventListener('DOMContentLoaded', () => {
  initContentPage({
    gridId: 'projects-grid',
    sortBarId: 'sort-bar',
    dataUrl: 'data/projects.json',
    fallbackUrl: 'https://raw.githubusercontent.com/Rainier-PS/rainier-ps.github.io/main/data/projects.json',
    errorPrefix: 'Project loading error',
    errorMessage: 'Unable to load projects at this time.',
    renderFn: renderProjectCard,
    afterRender: () => bindLightboxImages('.project-card img')
  });
});

function renderProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'proj-card project-card';

  const tagsHtml = project.tags && project.tags.length
    ? `<div class="proj-labels">${project.tags.map(t => `<span class="proj-label">${t}</span>`).join('')}</div>`
    : '';

  const dateLabel = formatDate(project.date);
  const dateHtml = dateLabel
    ? `<span class="proj-date" aria-label="Published ${dateLabel}">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
         <span class="proj-date-tooltip">${dateLabel}</span>
       </span>`
    : '';

  const buttonsHtml = (project.demo || project.github)
    ? `<div class="proj-buttons">
         ${project.demo   ? `<a href="${project.demo}"   class="proj-btn" target="_blank" rel="noopener"><span>Demo</span>${DEMO_ICON}</a>`   : ''}
         ${project.github ? `<a href="${project.github}" class="proj-btn" target="_blank" rel="noopener"><span>GitHub</span>${GITHUB_ICON}</a>` : ''}
       </div>`
    : '';

  card.innerHTML = `
    ${project.image ? `<img src="${project.image}" alt="${project.title}" loading="lazy" decoding="async" data-date="${dateLabel}">` : ''}
    <div class="proj-card-body">
      <div class="proj-card-header">
        <h3>${project.title}</h3>
        ${dateHtml}
      </div>
      <p>${project.description || ''}</p>
      ${tagsHtml}
      ${buttonsHtml}
    </div>
  `;
  return card;
}
