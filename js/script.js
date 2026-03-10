document.addEventListener("DOMContentLoaded", async () => {
  if (window.lucide) lucide.createIcons();

  initCopyrightYear();

  document.querySelectorAll('link[rel="preload"][as="style"]').forEach(link => {
    function enableStylesheet() {
      try { link.rel = 'stylesheet'; } catch (e) { }
    }
    link.addEventListener('load', enableStylesheet);
    if (link.sheet) enableStylesheet();
  });

  const [projects, awardsData] = await Promise.all([
    loadProjectsFromJSON(),
    loadAwardsFromJSON()
  ]);

  if (projects.length > 0) {
    DATA.projects = projects;
    DATA.projects.forEach(p => {
      projectData[p.slug] = {
        title: p.title,
        desc: p.description,
        links: [p.demo, p.github].filter(Boolean).join(' | ')
      };
    });
  }

  const rawAwards = Array.isArray(awardsData)
    ? awardsData
    : (awardsData.awards || awardsData.data || []);

  if (rawAwards.length > 0) {
    DATA.awards = rawAwards.map(item => ({
      title: item.title || item.award || item.name || item.eventName || "Untitled Award",
      description: item.description || item.desc || item.details || item.date || "",
      image: item.image || item.logo || null,
      ...item
    }));
  }

  const getPerPage = () => window.innerWidth <= 600 ? 1 : window.innerWidth <= 900 ? 2 : 3;

  const projectsGrid = document.getElementById('projects-grid');
  const awardsGrid = document.getElementById('awards-grid');

  if (projectsGrid && DATA.projects.length > 0) {
    renderCarousel({ containerId: 'projects-grid', items: DATA.projects, perPage: getPerPage() });
  }
  if (awardsGrid && DATA.awards.length > 0) {
    renderCarousel({ containerId: 'awards-grid', items: DATA.awards, perPage: getPerPage() });
  }

  initCarousels();
  bindLightboxImages();

  window.addEventListener('resize', () => {
    if (projectsGrid && DATA.projects.length > 0) {
      renderCarousel({ containerId: 'projects-grid', items: DATA.projects, perPage: getPerPage() });
    }
    if (awardsGrid && DATA.awards.length > 0) {
      renderCarousel({ containerId: 'awards-grid', items: DATA.awards, perPage: getPerPage() });
    }
    initCarousels();
    bindLightboxImages();
  });
});

function initCopyrightYear() {
  const copyrightYearSpan = document.getElementById("copyright-year");
  if (copyrightYearSpan) {
    const startYear = 2025;
    const currentYear = new Date().getFullYear();
    copyrightYearSpan.textContent = startYear === currentYear ? startYear : `${startYear}–${currentYear}`;
  }
}

const DATA = {
  projects: [],
  awards: []
};

async function loadProjectsFromJSON() {
  try {
    const res = await fetch(
      'https://raw.githubusercontent.com/Rainier-PS/rainier-ps.github.io/main/data/projects.json'
    );
    if (!res.ok) throw new Error('Failed to load projects.json');
    return await res.json();
  } catch (err) {
    console.error('Failed to load projects.json:', err);
    return [];
  }
}

async function loadAwardsFromJSON() {
  try {
    const res = await fetch(
      'https://raw.githubusercontent.com/Rainier-PS/rainier-ps.github.io/main/data/awards.json'
    );
    if (!res.ok) throw new Error('Failed to load awards.json');
    return await res.json();
  } catch (err) {
    console.error('Failed to load awards.json:', err);
    return [];
  }
}

const sections = document.querySelectorAll("section");
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("visible"); });
}, { threshold: 0.1 });
sections.forEach(sec => observer.observe(sec));

const header = document.getElementById("header");

if (header) {
  let scrollTimeout;
  window.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      header.style.boxShadow = window.scrollY > 50
        ? "0 4px 12px rgba(0,0,0,0.2)"
        : "0 2px 5px rgba(0,0,0,0.1)";
    }, 50);
  });
}

const tagline = document.getElementById("tagline");
let text = "High School Student • Aspiring Engineer • Tech Enthusiast";
function getTaglineText() {
  return window.innerWidth <= 600 ? text.replace(/ • /g, "\n") : text;
}

function startTypewriter() {
  if (!tagline) return;
  tagline.textContent = '';
  let i = 0;
  const finalText = getTaglineText();
  tagline.style.whiteSpace = window.innerWidth <= 600 ? 'pre-wrap' : 'normal';

  function typeWriter() {
    if (!tagline) return;
    if (i < finalText.length) {
      const char = finalText.charAt(i++);
      tagline.textContent += char;
      setTimeout(typeWriter, 60); // adjust speed here
    } else {
      tagline.style.borderRight = "none";
    }
  }

  typeWriter();
}

if (tagline) startTypewriter();

let typewriterTimeout;
if (tagline) {
  window.addEventListener('resize', () => {
    clearTimeout(typewriterTimeout);
    typewriterTimeout = setTimeout(startTypewriter, 200);
  });
}

const themeToggle = document.getElementById("theme-toggle");
const html = document.documentElement;
function setTheme(mode) {
  html.classList.toggle("dark", mode === "dark");
  localStorage.setItem("theme", mode); // Save immediately

  if (!themeToggle) return;

  themeToggle.textContent = '';
  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', mode === 'dark' ? 'sun' : 'moon');
  themeToggle.appendChild(icon);

  if (window.lucide) lucide.createIcons();
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme) setTheme(savedTheme); else setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
themeToggle?.addEventListener("click", () => { setTheme(html.classList.contains("dark") ? "light" : "dark"); });

function setCarouselSlide(carousel, index) {
  const track = carousel.querySelector(".carousel-track");
  const dots = carousel.querySelectorAll(".carousel-dots button");
  const max = dots.length - 1;

  const clamped = Math.max(0, Math.min(index, max));

  track.style.transform = `translateX(-${clamped * 100}%)`;

  dots.forEach(d => d.classList.remove("active"));
  dots[clamped]?.classList.add("active");

  carousel.dataset.activeIndex = clamped;
}

function initCarousels() {
  document.querySelectorAll("[data-carousel]").forEach(carousel => {
    const track = carousel.querySelector(".carousel-track");
    if (!track) return;

    const pages = Array.from(track.children);
    const dotsContainer = carousel.querySelector(".carousel-dots");
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';
    carousel.dataset.activeIndex = 0;

    pages.forEach((_, idx) => {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", `Go to slide ${idx + 1}`);
      if (idx === 0) dot.classList.add("active");

      dot.addEventListener("click", () => {
        setCarouselSlide(carousel, idx);
      });

      dotsContainer.appendChild(dot);
    });

    addSwipeSupport(carousel);
  });
}

function addSwipeSupport(carousel) {
  if (carousel.dataset.swipeBound === "true") return;
  carousel.dataset.swipeBound = "true";

  const track = carousel.querySelector(".carousel-track");
  if (!track) return;

  let startX = 0;
  let active = false;
  let handled = false;

  const threshold = 45;

  const getIndex = () => Number(carousel.dataset.activeIndex || 0);

  const start = x => {
    startX = x;
    active = true;
    handled = false;
  };

  const move = x => {
    if (!active || handled) return;

    const diff = x - startX;
    if (Math.abs(diff) > threshold) {
      const index = getIndex();
      setCarouselSlide(carousel, diff < 0 ? index + 1 : index - 1);
      handled = true;
    }
  };

  const end = () => {
    active = false;
    handled = false;
  };

  track.addEventListener("touchstart", e => start(e.touches[0].clientX), { passive: true });
  track.addEventListener("touchmove", e => move(e.touches[0].clientX), { passive: true });
  track.addEventListener("touchend", end);

  track.addEventListener("mousedown", e => start(e.clientX));
  window.addEventListener("mousemove", e => move(e.clientX));
  window.addEventListener("mouseup", end);
}

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
menuToggle?.addEventListener("click", () => {
  navLinks.classList.toggle("show");
  menuToggle.classList.toggle("open");
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
});

document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('show') &&
    !navLinks.contains(e.target) &&
    !menuToggle.contains(e.target)) {
    closeMenu();
  }
});

navLinks?.addEventListener('click', (e) => {
  if (e.target.tagName === 'A' || e.target.closest('a') || e.target.closest('button')) {
    closeMenu();
  }
});

function closeMenu() {
  navLinks.classList.remove('show');
  menuToggle.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

const logos = document.querySelectorAll('.brand img.logo');

const emailUser = "rainierps8";
const emailDomain = "gmail.com";
const emailLink = document.getElementById('email-link');
if (emailLink) emailLink.href = `mailto:${emailUser}@${emailDomain}`;


function renderCarousel({ containerId, items, perPage }) {
  const track = document.getElementById(containerId);
  if (!track) {
    return;
  }

  track.innerHTML = '';

  if (!items || items.length === 0) {
    return;
  }

  for (let i = 0; i < items.length; i += perPage) {
    const page = document.createElement('div');
    page.className = 'cards';

    items.slice(i, i + perPage).forEach(item => {
      const card = document.createElement('div');
      card.className = `card ${item.empty ? 'empty' : ''}`;

      if (item.empty) {
        card.textContent = item.title;
        page.appendChild(card);
        return;
      }

      card.innerHTML = `
          ${item.image ? `<img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async">` : ''}
          <h3>${item.title}</h3>
          <p>${item.description}</p>

          ${item.labels?.length ? `
            <div class="labels">
              ${item.labels.map(l => `<span class="label">${l}</span>`).join('')}
            </div>
          ` : ''}

          ${item.demo || item.github ? `
            <div class="buttons">
              ${item.demo ? `<a href="${item.demo}" class="btn" target="_blank" rel="noopener"><i data-lucide="external-link"></i> Demo</a>` : ''}
              ${item.github ? `<a href="${item.github}" class="btn" target="_blank" rel="noopener"><i data-lucide="github"></i> GitHub</a>` : ''}
            </div>
          ` : ''}
        `;

      page.appendChild(card);
    });

    track.appendChild(page);
  }

  if (window.lucide) lucide.createIcons();
}

const projectData = {};

const STATIC_DATA = {
  about: "I'm a high school student passionate about technology, science, and innovation. I enjoy creating projects that solve real-world problems while constantly exploring new ideas and learning new skills, whether through STEM competitions or personal projects. Feel free to check out my projects below!",
  experience: [
    "- Hack Club Member",
    "- Club Leader Hack Club Binus School Semarang",
    "- Hack the Hat Elective Member (Raspberry Pi & Sense HAT)",
    "- STEM Club Member",
    "- Digital Journalism Elective Member",
    "- RevoU SECC - Coding Camp"
  ],
  education: [
    "- Binus School Semarang — High School (2024–Present)",
    "- Daniel Creative School — Junior High School (2021–2024)",
    "- Daniel Creative School — Elementary (2015–2021)"
  ],
  skills: [
    { title: "Maths & Science", desc: "I have strong knowledge in mathematics and science, which I apply to problem-solving, experiments, research, and technical projects." },
    { title: "3D Printing & PCB Design", desc: "I design and assemble mechanical and electronic projects using Fusion 360 for 3D modeling and KiCad for PCB design, with hands-on experience in soldering and assembling custom electronics." },
    { title: "Programming", desc: "I have experience in programming languages such as Python, JavaScript (ES6+), SQL (basic), and Arduino (C/C++), as well as web technologies including HTML and CSS." },
    { title: "Languages", desc: "English (Fluent), Chinese (Learning), German (Learning), Indonesian (Native)" }
  ],
  contact: [
    { platform: "GitHub", link: "https://github.com/Rainier-PS" },
    { platform: "Email", link: "mailto:rainierps8@gmail.com" },
    { platform: "Instagram", link: "https://instagram.com/rainier_ps" },
    { platform: "Instructables", link: "https://www.instructables.com/member/Rainier-PS/" },
    { platform: "LinkedIn", link: "https://www.linkedin.com/in/LINKEDIN_USERNAME" },
    { platform: "Semarang, Indonesia", link: "https://www.google.com/maps/place/Semarang,+Indonesia" }
  ]
};



const lightbox = document.getElementById('imageLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const closeBtn = document.getElementById('closeLightbox');
const openBtn = document.getElementById('openInNewTab');

function bindLightboxImages() {
  document.querySelectorAll('#awards .card img, #projects .card img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
}

closeBtn?.addEventListener('click', () => {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
});

openBtn?.addEventListener('click', () => {
  if (lightboxImg.src) window.open(lightboxImg.src, '_blank', 'noopener');
});

if (lightbox) {
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key === 'Esc') {
    if (lightbox && lightbox.classList.contains('active')) closeLightbox();
  }
});

// Back to Top Logic
const backToTopBtn = document.getElementById("backToTop");
if (backToTopBtn) {
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  });
}

function initGitHubGraph() {
  const calendar = document.getElementById("calendar");
  if (!calendar) return;

  const USERNAME = "Rainier-PS";
  const YEARS = [2026, 2025, 2024];

  const monthsRow = document.getElementById("months");
  const summary = document.getElementById("summary");
  const tooltip = document.getElementById("tooltip");
  const yearSelect = document.getElementById("yearSelect");
  const yearButtons = document.getElementById("yearButtons");

  function level(count) {
    if (count >= 8) return 4;
    if (count >= 4) return 3;
    if (count >= 1) return 2;
    return 0;
  }

  function buildYearButtons(active) {
    yearButtons.innerHTML = "";
    YEARS.forEach(y => {
      const btn = document.createElement("button");
      btn.className = "year-btn" + (y === active ? " active" : "");
      btn.textContent = y;
      btn.onclick = () => loadYear(y);
      yearButtons.appendChild(btn);
    });
  }

  async function loadYear(year) {
    calendar.innerHTML = "";
    monthsRow.innerHTML = "";
    summary.textContent = "Loading…";
    yearSelect.value = year;
    buildYearButtons(year);

    try {
      const res = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=${year}`
      );
      const data = await res.json();
      const days = data.contributions;

      summary.textContent = `${data.total[year]} contributions in the last year`;

      const monthCounts = {};
      let week = document.createElement("div");
      week.className = "week";

      const firstDay = new Date(days[0].date).getDay();
      for (let i = 0; i < firstDay; i++) {
        week.appendChild(document.createElement("div")).className = "day";
      }

      days.forEach(d => {
        const date = new Date(d.date);
        const m = date.getMonth();
        monthCounts[m] = (monthCounts[m] || 0) + 1;

        const cell = document.createElement("div");
        const lvl = level(d.count);
        cell.className = "day" + (lvl ? ` lvl-${lvl}` : "");

        cell.setAttribute(
          "aria-label",
          `${d.count} contributions on ${d.date}`
        );

        cell.onmouseenter = () => {
          tooltip.textContent = `${d.count} contributions on ${d.date}`;
          tooltip.style.opacity = 1;
        };
        cell.onmousemove = e => {
          tooltip.style.left = e.clientX + 12 + "px";
          tooltip.style.top = e.clientY - 12 + "px";
        };
        cell.onmouseleave = () => tooltip.style.opacity = 0;

        week.appendChild(cell);

        if (date.getDay() === 6) {
          calendar.appendChild(week);
          week = document.createElement("div");
          week.className = "week";
        }
      });

      while (week.children.length < 7) {
        week.appendChild(document.createElement("div")).className = "day";
      }
      calendar.appendChild(week);

      Object.entries(monthCounts).forEach(([m, count]) => {
        const label = document.createElement("div");
        label.className = "month";
        label.style.setProperty("--span", Math.ceil(count / 7));
        label.textContent = new Date(2024, m).toLocaleString("en", { month: "short" });
        monthsRow.appendChild(label);
      });
    } catch (e) {
      console.error("Failed to load GitHub contributions:", e);
      summary.textContent = "Failed to load contributions.";
    }
  }

  yearSelect.onchange = e => loadYear(+e.target.value);
  loadYear(YEARS[0]);
}

async function loadPublications() {
  const grid = document.getElementById('publications-grid');
  if (!grid) return;

  try {
    const res = await fetch('https://raw.githubusercontent.com/Rainier-PS/rainier-ps.github.io/main/data/publications.json');
    if (!res.ok) throw new Error('Failed to load publications');
    const publications = await res.json();

    grid.innerHTML = '';

    publications.forEach(pub => {
      const article = document.createElement('article');
      article.className = 'pub-card';
      article.innerHTML = `
        <a href="${pub.url}" target="_blank" rel="noopener noreferrer" class="pub-img-link" aria-label="Read ${pub.title}">
          <div class="pub-img-wrapper icon-cover">
             <i data-lucide="${pub.icon || 'book'}" class="pub-icon"></i>
          </div>
        </a>
        <div class="pub-content">
          <h3><a href="${pub.url}" target="_blank" rel="noopener noreferrer">${pub.title}</a></h3>
          <p>${pub.description}</p>
          
          <div class="pub-tags">
             ${pub.tags ? pub.tags.map(t => `<span class="tag">${t}</span>`).join('') : ''}
          </div>

          <div class="pub-footer">
             <span class="pub-source"><i data-lucide="book-open"></i> Instructables</span>
             <a href="${pub.url}" target="_blank" rel="noopener noreferrer" class="read-more">Read</a>
          </div>
        </div>
      `;
      grid.appendChild(article);
    });

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    console.error('Error loading publications:', err);
    grid.innerHTML = '<p style="text-align:center; color:var(--muted);">Unable to load publications at this time.</p>';
  }
}

initGitHubGraph();
loadPublications();
