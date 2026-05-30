const DEMO_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:13px;height:13px;display:inline-block;flex-shrink:0;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
const GITHUB_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:13px;height:13px;display:inline-block;flex-shrink:0;"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>';

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
            if (!res.ok) throw new Error('Local fetch failed');
        } catch (e) {
            console.warn('Local fetch failed, trying remote...', e);
            res = await fetch('https://raw.githubusercontent.com/Rainier-PS/rainier-ps.github.io/main/data/projects.json');
        }

        if (!res.ok) throw new Error('Failed to load projects');
        const projects = await res.json();

        grid.innerHTML = '';

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'proj-card project-card';

            const labelsHtml = project.labels && project.labels.length
                ? `<div class="proj-labels">${project.labels.map(l => `<span class="proj-label">${l}</span>`).join('')}</div>`
                : '';

            const buttonsHtml = (project.demo || project.github)
                ? `<div class="proj-buttons">
                     ${project.demo ? `<a href="${project.demo}" class="proj-btn" target="_blank" rel="noopener"><span>Demo</span>${DEMO_ICON}</a>` : ''}
                     ${project.github ? `<a href="${project.github}" class="proj-btn" target="_blank" rel="noopener"><span>GitHub</span>${GITHUB_ICON}</a>` : ''}
                   </div>`
                : '';

            card.innerHTML = `
                ${project.image ? `<img src="${project.image}" alt="${project.title}" loading="lazy" decoding="async">` : ''}
                <div class="proj-card-body">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    ${labelsHtml}
                    ${buttonsHtml}
                </div>
            `;
            grid.appendChild(card);
        });

        initLightbox();
        if (window.ScrollTrigger) ScrollTrigger.refresh();

    } catch (err) {
        console.error('Project loading error:', err);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Unable to load projects at this time.</p>';
    }
}

function initLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('closeLightbox');
    const openBtn = document.getElementById('openInNewTab');

    if (!lightbox || !lightboxImg) return;

    document.querySelectorAll('.project-card img').forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    const close = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') close();
    });

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            if (lightboxImg.src) window.open(lightboxImg.src, '_blank');
        });
    }
}
