const terminal = document.getElementById('terminal');
const output = document.getElementById('terminal-output');
const input = document.getElementById('terminal-input');
const backBtn = document.getElementById('terminal-back');
const helpBtn = document.getElementById('terminal-help');

const prompt = 'guest@portfolio:~$ ';
let history = [];
let historyIndex = -1;
let loginTime = new Date();

// Helper Functions

function autoScroll() {
    if (output) output.scrollTop = output.scrollHeight;
}

function typeLine(line, delay = 20, callback) {
    if (!output) return;
    const lineDiv = document.createElement('div');
    output.appendChild(lineDiv);
    let i = 0;
    const interval = setInterval(() => {
        lineDiv.textContent += line.charAt(i);
        i++;
        autoScroll();
        if (i === line.length) {
            clearInterval(interval);
            if (callback) callback();
        }
    }, delay);
}

function printBlock(text) {
    if (!output) return;
    const div = document.createElement('div');
    div.textContent = text;
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordBreak = 'break-word';
    output.appendChild(div);
    autoScroll();
}

// NOTE: typeHTML renders internal, trusted HTML only.
// Do NOT pass user-generated content into this function.
function typeHTML(html, delay = 10, callback) {
    if (!output) return;
    const temp = document.createElement("div");
    temp.innerHTML = html.trim();
    const lines = [];

    temp.querySelectorAll(":scope > *").forEach(el => {
        lines.push(el.outerHTML);
    });

    let i = 0;
    function typeNext() {
        if (i < lines.length) {
            let line = lines[i];
            let j = 0;
            const div = document.createElement("div");
            output.appendChild(div);

            function typeChar() {
                if (j < line.length) {
                    div.innerHTML = line.slice(0, j + 1);
                    j++;
                    autoScroll();
                    setTimeout(typeChar, delay * 0.75);
                } else {
                    i++;
                    setTimeout(typeNext, delay * 2);
                }
            }

            typeChar();
        } else if (callback) {
            callback();
        }
    }

    typeNext();
}

function bootSequence() {
    if (!output) return;
    const lines = [
        '[  OK  ] Initializing system modules...',
        '[  OK  ] Checking environment...',
        '[  OK  ] Network services started.',
        '[  OK  ] User session created.',
        '--- Terminal Ready ---',
        'Type "help" to get started.'
    ];
    output.textContent = '';
    lines.forEach((line, i) => {
        setTimeout(() => typeLine(line, 10), i * 500);
    });
    setTimeout(() => {
        loginTime = new Date();
        if (input) {
            input.focus();
        }
        autoScroll();
    }, lines.length * 500 + 500);
}

// Commands

const commands = {
    help: () => { helpFunction(); return ''; },

    about: 'Hi! I\'m Rainier, a high school student passionate about technology and engineering.',

    echo: (args) => args.join(' '),

    date: () => {
        const now = new Date();
        const options = {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric',
            hour12: false,
        };
        const formatted = new Intl.DateTimeFormat('en-US', options)
            .format(now)
            .replace(',', '');
        const offset = -now.getTimezoneOffset();
        const sign = offset >= 0 ? '+' : '-';
        const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
        const minutes = String(Math.abs(offset) % 60).padStart(2, '0');
        return `${formatted} UTC${sign}${hours}${minutes}`;
    },

    who: () => {
        const date = loginTime.toISOString().split('T')[0];
        const time = loginTime.toTimeString().split(' ')[0].slice(0, 5);
        return `guest pts/1        ${date} ${time}`;
    },

    whoami: () => {
        return 'guest';
    },

    ls: (args) => {
        const structure = {
            '/': ['about', 'experience', 'education', 'skills', 'projects', 'awards', 'contact'],
            'projects': Object.keys(projectData || {})
        };

        // DOM Scraping might fail if not on index.html, fallbacks to STATIC_DATA are handled below
        const experienceItems = document.querySelectorAll('#experience ul li');
        const educationItems = document.querySelectorAll('#education p');
        const skillCards = document.querySelectorAll('#skills .card h3');

        const sections = {
            experience: experienceItems.length ? Array.from(experienceItems).map(li => li.textContent.trim()) : (STATIC_DATA.experience || []).map(s => s.replace(/^- /, '')),
            education: educationItems.length ? Array.from(educationItems).map(p => p.textContent.trim()) : (STATIC_DATA.education || []).map(s => s.replace(/^- /, '')),
            skills: skillCards.length ? Array.from(skillCards).map(h3 => h3.textContent.trim()) : (STATIC_DATA.skills || []).map(s => s.title),
            awards: (DATA.awards || []).map(card => ({
                title: card.title || '',
                desc: card.description || ''
            }))
        };

        if (!args[0]) return structure['/'].join('\n');
        if (args[0] === 'projects') return structure['projects'].join('\n');
        if (args[0] === 'contact') {
            const links = document.querySelectorAll('#contact .contact-links a');
            if (links.length) {
                contactTable();
            } else {
                const container = document.createElement("div");
                container.classList.add("help-table", "contact-table");

                const title = document.createElement("div");
                title.textContent = "You can reach me at:";
                title.style.marginBottom = "8px";
                container.appendChild(title);

                const header = document.createElement("div");
                header.classList.add("help-row", "help-header");
                header.innerHTML = `<div class="help-command">Platform</div><div class="help-desc">Username / Address</div>`;
                container.appendChild(header);

                (STATIC_DATA.contact || []).forEach(({ platform, link }) => {
                    const row = document.createElement("div");
                    row.classList.add("help-row");
                    const shortLink = link.replace(/^https?:\/\//, '').replace(/^mailto:/, '');
                    row.innerHTML = `
                    <div class="help-command">${platform}</div>
                    <div class="help-desc"><a href="${link}" target="_blank" rel="noopener" class="cli-link">${shortLink}</a></div>
                `;
                    container.appendChild(row);
                });

                typeHTML(container.outerHTML, 10);
                autoScroll();
            }
            return '';
        }
        if (args[0] === 'awards') {
            const htmlMode = args[1] === '-html';
            if (htmlMode) {
                const container = document.createElement("div");
                container.classList.add("help-table", "awards-table");

                const header = document.createElement("div");
                header.classList.add("help-row", "help-header");
                header.innerHTML = `<div class="help-command">Award</div><div class="help-desc">Description</div>`;
                container.appendChild(header);

                (DATA.awards || []).forEach(a => {
                    const row = document.createElement("div");
                    row.classList.add("help-row");
                    row.innerHTML = `
              <div class="help-command">${a.title}</div>
              <div class="help-desc">${a.description}</div>
            `;
                    container.appendChild(row);
                });

                typeHTML(container.outerHTML, 10);
                autoScroll();
                return '';
            } else {
                return (DATA.awards || []).map(a => a.title || '(untitled)').join('\n');
            }
        }


        if (sections[args[0]]) return sections[args[0]].map(s => typeof s === 'string' ? s : s.title).join('\n');

        return `ls: cannot access '${args[0]}': No such directory`;
    },

    cat: (args) => {
        if (!args[0]) return 'cat: missing file operand';
        const key = args[0].replace(/^projects\//, '');

        if (projectData && projectData[key]) {
            const { title, desc, links } = projectData[key];
            return `${title}\n${desc}\nLinks: ${links}`;
        }

        const sections = {
            about: document.querySelector('#about p')?.textContent.trim() || STATIC_DATA.about,
            experience: (Array.from(document.querySelectorAll('#experience ul li')).map(li => `- ${li.textContent.trim()}`).join('\n')) || (STATIC_DATA.experience || []).join('\n'),
            education: (Array.from(document.querySelectorAll('#education p')).map(p => `- ${p.textContent.trim()}`).join('\n')) || (STATIC_DATA.education || []).join('\n'),
            skills: (Array.from(document.querySelectorAll('#skills .card')).map(card => {
                const title = card.querySelector('h3')?.textContent.trim() || '';
                const desc = card.querySelector('p')?.textContent.trim() || '';
                return `${title}: ${desc}`;
            }).join('\n\n')) || (STATIC_DATA.skills || []).map(s => `${s.title}: ${s.desc}`).join('\n\n'),
            awards: (DATA.awards || []).map(card => {
                const title = card.title || '';
                const desc = card.description || '';
                return `${title} — ${desc}`;
            }).join('\n')
        };

        if (sections[args[0]]) return sections[args[0]] || '(empty)';
        return `cat: ${args[0]}: No such file or directory`;
    },

    clear: () => {
        if (output) output.textContent = '';
        autoScroll();
        return '';
    },

    history: () => {
        if (history.length === 0) return 'No commands in history.';
        return history.map((cmd, i) => `${i + 1}  ${cmd}`).join('\n');
    },

    exit: () => {
        window.location.href = 'index.html';
        return 'Logging out...';
    },

    // Secret Commands
    repo: () => {
        window.open('https://github.com/Rainier-PS/rainier-ps.github.io', '_blank');
        return 'Opening GitHub repository...';
    },

    dev: () => {
        return '--- SECRET DEVELOPER VIEW ---\n' +
            'repo          : Open main GitHub repository\n' +
            'view <file>   : View source code (opens GitHub)\n\n' +
            '[ HTML ]\n' +
            '  index.html, projects.html, publications.html,\n' +
            '  labs.html, awards.html, terminal.html\n\n' +
            '[ CSS ]\n' +
            '  styles.css, projects.css, labs.css,\n' +
            '  awards.css, terminal.css\n\n' +
            '[ JavaScript ]\n' +
            '  script.js, projects.js, labs.js,\n' +
            '  awards.js, terminal.js\n\n' +
            '[ Data / Config ]\n' +
            '  publications.json, projects.json, awards.json,\n' +
            '  sitemap.xml, readme.md';
    },

    view: (args) => {
        if (!args[0]) return 'Usage: view <filename>\nTry "dev" for a list of files.';

        const file = args[0].toLowerCase();
        const map = {
            'index.html': 'index.html',
            'terminal.html': 'terminal.html',
            'projects.html': 'projects.html',
            'publications.html': 'publications.html',
            'labs.html': 'labs.html',
            'awards.html': 'awards.html',
            'sitemap.xml': 'sitemap.xml',
            'readme.md': 'README.md',
            'script.js': 'js/script.js',
            'projects.js': 'js/projects.js',
            'labs.js': 'js/labs.js',
            'awards.js': 'js/awards.js',
            'terminal.js': 'js/terminal.js',
            'styles.css': 'css/styles.css',
            'projects.css': 'css/projects.css',
            'labs.css': 'css/labs.css',
            'awards.css': 'css/awards.css',
            'terminal.css': 'css/terminal.css',
            'projects.json': 'data/projects.json',
            'awards.json': 'data/awards.json',
            'publications.json': 'data/publications.json'
        };

        if (!map[file]) return `File not found: ${file}`;

        const baseUrl = 'https://raw.githubusercontent.com/Rainier-PS/rainier-ps.github.io/main/';
        const url = baseUrl + map[file];

        window.open(url, '_blank');
        return `Opening ${file} in a new tab...`;
    },

    color: (args) => {
        if (args.length < 3) return 'Usage: color <r> <g> <b>\nExample: color 255 100 50';
        const [r, g, b] = args.map(Number);
        if ([r, g, b].some(n => isNaN(n) || n < 0 || n > 255)) return 'Invalid value. Use 0-255.';

        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        const isDark = brightness < 60;

        const colorVal = `rgb(${r}, ${g}, ${b})`;
        if (terminal) terminal.style.setProperty('--terminal-color', colorVal);

        const btnColor = isDark ? '#0f0' : colorVal;
        if (terminal) terminal.style.setProperty('--terminal-btn-color', btnColor);

        return `Terminal color set to ${colorVal}`;
    },

    theme: (args) => {
        if (!args[0] || !['light', 'dark'].includes(args[0])) return 'Usage: theme <light|dark>';
        if (typeof setTheme === 'function') setTheme(args[0]);
        return `Theme set to ${args[0]}.`;
    },

    accent: (args) => {
        if (args.length < 3) return 'Usage: accent <r> <g> <b>\nExample: accent 0 120 255';

        const [r, g, b] = args.map(Number);
        if ([r, g, b].some(n => isNaN(n) || n < 0 || n > 255)) return 'Invalid value. Use 0-255.';

        const colorVal = `rgb(${r}, ${g}, ${b})`;

        const docStyle = document.documentElement.style;
        docStyle.setProperty('--link', colorVal);
        docStyle.setProperty('--link-hover', colorVal);

        localStorage.setItem('accent-color', colorVal);

        return `Accent color set to ${colorVal}`;
    },

    restore: () => {
        localStorage.removeItem('accent-color');
        document.documentElement.style.removeProperty('--link');
        document.documentElement.style.removeProperty('--link-hover');
        const defaultTerm = '#0f0';
        if (terminal) {
            terminal.style.setProperty('--terminal-color', defaultTerm);
            terminal.style.setProperty('--terminal-btn-color', defaultTerm);
        }

        localStorage.removeItem('theme');
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        if (typeof setTheme === 'function') setTheme(systemTheme);

        return 'System restored to default settings.';
    },

    gh: async (args) => {
        const year = args[0] || new Date().getFullYear();
        const USERNAME = "Rainier-PS";

        try {
            printBlock(`Fetching GitHub data for ${year}...`);

            const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=${year}`);
            if (!res.ok) throw new Error('Failed to fetch data');

            const data = await res.json();
            const count = data.total[year];

            if (count === undefined) {
                printBlock(`No data found for year ${year}.`);
                return '';
            }

            const outputStr = `\nGitHub Activity for ${USERNAME}:\n` +
                `---------------------------------\n` +
                `Year: ${year}\n` +
                `Total Contributions: ${count}\n`;

            printBlock(outputStr);
            return '';
        } catch (e) {
            printBlock(`Error: Could not retrieve contributions for ${year}.`);
            return '';
        }
    },

    matrix: () => {
        document.body.classList.toggle('matrix-mode');
        return document.body.classList.contains('matrix-mode') ? 'Matrix mode enabled.' : 'Matrix mode disabled.';
    }
};

// Execution & Events

if (input) {
    input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const raw = input.value.trim();
            if (!raw) return;

            history.push(raw);
            historyIndex = history.length;

            const div = document.createElement('div');
            div.innerHTML = `<span class="prompt">${prompt}</span> ${raw}`;
            output.appendChild(div);

            input.value = '';
            autoScroll();

            const parts = raw.split(' ');
            const cmd = parts[0].toLowerCase();
            const args = parts.slice(1);

            if (commands[cmd]) {
                const resultOrPromise = typeof commands[cmd] === 'function' ? commands[cmd](args) : commands[cmd];
                if (resultOrPromise instanceof Promise) {
                    try {
                        const result = await resultOrPromise;
                        if (result !== undefined && result !== '') typeLine(result);
                    } catch (err) {
                        typeLine(`Error: ${err.message}`);
                    }
                } else {
                    if (resultOrPromise !== undefined && resultOrPromise !== '') typeLine(resultOrPromise);
                }
            } else {
                typeLine(`bash: ${cmd}: command not found`);
            }
        } else if (e.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                input.value = history[historyIndex];
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (historyIndex < history.length - 1) {
                historyIndex++;
                input.value = history[historyIndex];
            } else {
                historyIndex = history.length;
                input.value = '';
            }
            e.preventDefault();
        }
    });

    document.addEventListener('click', () => {
        const sel = window.getSelection();
        if (sel.toString().length > 0) return;
        if (input) input.focus();
    });

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            input.value = 'help';
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            input.focus();
        });
    }

    bootSequence();
}

function helpFunction() {
    const container = document.createElement("div");
    container.classList.add("help-table");

    const header = document.createElement("div");
    header.classList.add("help-row", "help-header");
    header.innerHTML = `<div class="help-command">Command</div><div class="help-desc">Description</div>`;
    container.appendChild(header);

    const cmdList = [
        ["help", "Show all available commands"],
        ["about", "Display information about me"],
        ["ls", "List sections or projects"],
        ["cat", "Display section or project content"],
        ["echo", "Display a line of text"],
        ["date", "Show the current date and time"],
        ["who", "Show who is logged in"],
        ["whoami", "Display the current user"],
        ["clear", "Clear the terminal screen"],
        ["history", "Show previously entered commands"],
        ["color", "Change terminal text color (RGB)"],
        ["gh", "Check GitHub contributions"],
        ["theme", "Set site theme (light/dark)"],
        ["accent", "Set site accent color (RGB)"],
        ["restore", "Restore all default settings"],
        ["matrix", "Toggle matrix visual effect"],
        ["exit", "Return to main site"]
    ];

    cmdList.forEach(([cmd, desc]) => {
        const row = document.createElement("div");
        row.classList.add("help-row");
        row.innerHTML = `
        <div class="help-command"><span class="neon">${cmd}</span></div>
        <div class="help-desc">${desc}</div>
      `;
        container.appendChild(row);
    });

    typeHTML(container.outerHTML, 10);
    autoScroll();
}

function contactTable() {
    const container = document.createElement("div");
    container.classList.add("help-table", "contact-table");

    const title = document.createElement("div");
    title.textContent = "You can reach me at:";
    title.style.marginBottom = "8px";
    container.appendChild(title);

    const header = document.createElement("div");
    header.classList.add("help-row", "help-header");
    header.innerHTML = `<div class="help-command">Platform</div><div class="help-desc">Username / Address</div>`;
    container.appendChild(header);

    const contacts = Array.from(document.querySelectorAll('#contact .contact-links a')).map(a => ({
        platform: a.textContent.trim(),
        link: a.href
    }));

    let contactList = contacts;
    if (contacts.length === 0 && STATIC_DATA && STATIC_DATA.contact) {
        contactList = STATIC_DATA.contact;
    }

    contactList.forEach(({ platform, link }) => {
        const row = document.createElement("div");
        row.classList.add("help-row");
        const shortLink = link.replace(/^https?:\/\//, '').replace(/^mailto:/, '');
        row.innerHTML = `
        <div class="help-command">${platform}</div>
        <div class="help-desc"><a href="${link}" target="_blank" rel="noopener" class="cli-link">${shortLink}</a></div>
      `;
        container.appendChild(row);
    });

    typeHTML(container.outerHTML, 10);
    autoScroll();
}

