const DEMO_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:13px;height:13px;display:inline-block;flex-shrink:0;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
const GITHUB_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:13px;height:13px;display:inline-block;flex-shrink:0;"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>';

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

function renderGrid(grid, data) {
    grid.innerHTML = '';
    const frag = document.createDocumentFragment();
    data.forEach(p => frag.appendChild(renderProjectCard(p)));
    grid.appendChild(frag);
    initLightbox();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
}

document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
});

async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    try {
        let res;
        try {
            res = await fetch('data/projects.json');
            if (!res.ok) throw new Error();
        } catch {
            res = await fetch('https://raw.githubusercontent.com/Rainier-PS/rainier-ps.github.io/main/data/projects.json');
        }

        if (!res.ok) throw new Error('Failed to load projects');
        const raw = await res.json();

        const projects = raw.map(p => ({ ...p, _date: parseDateMs(p.date) }));

        const sortSelect = initSortUI('sort-bar', key => {
            renderGrid(grid, sortData(projects, key));
        });

        renderGrid(grid, sortData(projects, sortSelect.value));

    } catch (err) {
        console.error('Project loading error:', err);
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">Unable to load projects at this time.</p>';
    }
}

function initLightbox() {
    bindLightboxImages('.project-card img');
}
