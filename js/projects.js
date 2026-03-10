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
            card.className = 'card project-card';

            const labelsHtml = project.labels && project.labels.length
                ? `<div class="labels">${project.labels.map(l => `<span class="label">${l}</span>`).join('')}</div>`
                : '';

            const buttonsHtml = (project.demo || project.github)
                ? `<div class="buttons">
                     ${project.demo ? `<a href="${project.demo}" class="btn" target="_blank" rel="noopener"><i data-lucide="external-link"></i> Demo</a>` : ''}
                     ${project.github ? `<a href="${project.github}" class="btn" target="_blank" rel="noopener"><i data-lucide="github"></i> GitHub</a>` : ''}
                   </div>`
                : '';

            card.innerHTML = `
                ${project.image ? `<img src="${project.image}" alt="${project.title}" loading="lazy" style="cursor: zoom-in">` : ''}
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                ${labelsHtml}
                ${buttonsHtml}
            `;
            grid.appendChild(card);
        });

        if (window.lucide) lucide.createIcons();
        initLightbox();

    } catch (err) {
        console.error('Project loading error:', err);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--subtext);">Unable to load projects at this time.</p>';
    }
}

function initLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('closeLightbox');
    const openBtn = document.getElementById('openInNewTab');

    if (!lightbox || !lightboxImg) return;

    // Attach click events to dynamic images
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
