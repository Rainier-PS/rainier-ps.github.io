(function () {
  var terminal = document.getElementById('terminal');
  var output = document.getElementById('terminal-output');
  var input = document.getElementById('terminal-input');
  var promptEl = document.getElementById('prompt');

  var USER = 'rainier';
  var HOST = 'portfolio';
  var HOME = '/home/' + USER;
  var cwd = HOME;
  var history = [];
  var historyIndex = -1;
  var prevCwd = HOME;
  var ENV = {
    USER: USER,
    HOME: HOME,
    HOSTNAME: HOST,
    PWD: cwd,
    SHELL: '/bin/bash',
    TERM: 'xterm-256color',
    MOTION: 'on'
  };

  function currentMotion() {
    try { return localStorage.getItem('motion') === 'off' ? 'off' : 'on'; } catch (e) { return 'on'; }
  }

  function applyMotion(value, persist) {
    ENV.MOTION = value;
    document.documentElement.dataset.motion = value;
    if (persist) {
      try { localStorage.setItem('motion', value); } catch (e) { }
    }
  }

  ENV.MOTION = currentMotion();
  document.documentElement.dataset.motion = ENV.MOTION;

  window.addEventListener('storage', function (e) {
    if (e.key === 'motion' && e.newValue) {
      applyMotion(e.newValue === 'off' ? 'off' : 'on', false);
    }
  });

  var VIRTUAL_FS = {
    '/': { type: 'dir', children: {
      'home': { type: 'dir', children: {
        'rainier': { type: 'dir', children: {
          'about': { type: 'dir', children: {
            'bio.txt': { type: 'file', content: function () { return 'Hi! I\'m Rainier, a high school student passionate about technology, science, and innovation. I enjoy creating projects that solve real-world problems while constantly exploring new ideas and learning new skills, whether through STEM competitions or personal projects.'; } },
            'education.txt': { type: 'file', content: function () { return 'Binus School Semarang - High School (2024 - Present)\nDaniel Creative School - Junior High School (2021 - 2024)\nDaniel Creative School - Elementary (2015 - 2021)'; } },
            'links.txt': { type: 'file', content: function () { return 'Website:   https://rainier-ps.github.io\nGitHub:    https://github.com/Rainier-PS\nLinkedIn:  https://www.linkedin.com/in/rainierps'; } }
          } },
          'contact': { type: 'dir', children: {
            'github.txt': { type: 'file', content: function () { return 'https://github.com/Rainier-PS'; } },
            'linkedin.txt': { type: 'file', content: function () { return 'https://www.linkedin.com/in/rainierps'; } },
            'instagram.txt': { type: 'file', content: function () { return 'https://instagram.com/rainier_ps'; } },
            'instructables.txt': { type: 'file', content: function () { return 'https://www.instructables.com/member/Rainier-PS/'; } },
            'location.txt': { type: 'file', content: function () { return 'Semarang, Indonesia'; } }
          } },
          'experience': { type: 'dir', children: {
            'garuda-hacks.txt': { type: 'file', content: function () { return 'Garuda Hacks 7.0 Volunteer\nhttps://www.garudahacks.com/'; } },
            'hack-club.txt': { type: 'file', content: function () { return 'Hack Club Member\nhttps://hackclub.com'; } },
            'hack-club-bss.txt': { type: 'file', content: function () { return 'Club Leader - Hack Club Binus School Semarang\nhttps://hackclubbss.github.io'; } },
            'hack-the-hat.txt': { type: 'file', content: function () { return 'Hack the Hat Elective Member (Raspberry Pi & Sense HAT)'; } },
            'stem-club.txt': { type: 'file', content: function () { return 'STEM Club Member'; } },
            'digital-journalism.txt': { type: 'file', content: function () { return 'Digital Journalism Elective Member'; } },
            'revoU-secc.txt': { type: 'file', content: function () { return 'RevoU SECC - Coding Camp'; } }
          } },
          'projects': { type: 'dir', children: {
            'invitation-website-template.txt': { type: 'file', content: function () { return 'Invitation Website Template\nA free, modern, and responsive invitation website template built with HTML, CSS, and vanilla JavaScript.\nDemo:  https://rainier-ps.github.io/Invitation-Template/\nRepo:  https://github.com/Rainier-PS/Invitation-Template'; } },
            'diy-bluetooth-mechanical-keyboard.txt': { type: 'file', content: function () { return 'DIY Bluetooth Mechanical Keyboard\nCustom-designed Bluetooth mechanical keyboard with hot-swappable switches, USB-C, slide potentiometer, NFC, and 6-degree ergonomic tilt.\nRepo:  https://github.com/Rainier-PS/DIY-Bluetooth-Mechanical-Keyboard'; } },
            'hackpad.txt': { type: 'file', content: function () { return 'Hackpad\nA DIY custom macropad built using a Xiao RP2040 for Hack Club Highway to Undercity.\nRepo:  https://github.com/Rainier-PS/Hackpad-Rainier'; } },
            'dogface-pcb-art-keychain.txt': { type: 'file', content: function () { return 'DogFace PCB Art Keychain\nA dog-shaped interactive PCB art keychain with LEDs, buttons, vibration motor, and custom outline made with KiCad.\nRepo:  https://github.com/Rainier-PS/DogFace-PCB-Art'; } },
            'smart-light-based-canopy-system.txt': { type: 'file', content: function () { return 'Smart Light-Based Canopy System\nAn eco-friendly smart home prototype using an LDR and Arduino Uno.\nDemo:  https://rainier-ps.github.io/Light-Based-Canopy-System/\nRepo:  https://github.com/Rainier-PS/Light-Based-Canopy-System'; } },
            'smart-wifi-fish-feeder.txt': { type: 'file', content: function () { return 'Smart WiFi Fish Feeder\nA smart WiFi controlled fish feeder built using an ESP32 and SG90 servo.\nRepo:  https://github.com/Rainier-PS/Smart-WiFi-Fish-Feeder'; } },
            'soundtune.txt': { type: 'file', content: function () { return 'SoundTune\nAn Android app that automatically adjusts media volume based on ambient noise levels.\nRepo:  https://github.com/Rainier-PS/SoundTune'; } }
          } },
          'publications': { type: 'dir', children: {
            'smart-wifi-fish-feeder.txt': { type: 'file', content: function () { return 'Smart WiFi Fish Feeder\nA DIY automated fish feeder controlled via WiFi using an ESP32 and Telegram integration.\nhttps://www.instructables.com/Smart-WiFi-Fish-Feeder/'; } },
            'esp32-countdown-timer.txt': { type: 'file', content: function () { return 'ESP32 WiFi New Year Countdown Timer\nBuild a synchronized countdown timer using ESP32 that fetches precise time from the internet.\nhttps://www.instructables.com/ESP32-WiFi-New-Year-Countdown-Timer-Beginner-Frien/'; } },
            'arduino-guide-part1.txt': { type: 'file', content: function () { return "Beginner's Guide to Arduino - Part 1\nLearning Arduino basics and electronics concepts without needing a physical board (Simulation).\nhttps://www.instructables.com/Beginners-Guide-to-Arduino-Part-1-Learning-Arduino/"; } },
            'arduino-guide-part2.txt': { type: 'file', content: function () { return "Beginner's Guide to Arduino - Part 2\nBuilding your first real circuits and understanding breadboards and basic components.\nhttps://www.instructables.com/Beginners-Guide-to-Arduino-Part-2-Building-Your-Fi/"; } },
            'arduino-guide-part3.txt': { type: 'file', content: function () { return "Beginner's Guide to Arduino - Part 3\nExploring sensors, serial communication, and more advanced interaction techniques.\nhttps://www.instructables.com/Beginners-Guide-to-Arduino-Part-3-Sensors-Communic/"; } }
          } },
          'skills': { type: 'dir', children: {
            'programming.txt': { type: 'file', content: function () { return 'Python, JavaScript (ES6+), SQL, Arduino (C/C++), HTML, CSS'; } },
            '3d-printing.txt': { type: 'file', content: function () { return 'Fusion 360 for 3D modeling, KiCad for PCB design, hands-on soldering'; } },
            'languages.txt': { type: 'file', content: function () { return 'English (Fluent), Chinese (Learning), German (Learning), Indonesian (Native)'; } },
            'maths-science.txt': { type: 'file', content: function () { return 'Strong foundation in mathematics and science applied to problem-solving, experiments, research, and technical projects.'; } }
          } }
        } }
      } },
      'etc': { type: 'dir', children: {
        'hostname': { type: 'file', content: function () { return 'portfolio'; } },
        'motd': { type: 'file', content: function () { return ''; } }
      } },
      'tmp': { type: 'dir', children: {} }
    } }
  };

  function getNode(path) {
    if (path === '/') return { node: VIRTUAL_FS['/'], parent: null, name: '/' };
    var abs = path.startsWith('/') ? path : (cwd === '/' ? cwd + path : cwd + '/' + path);
    abs = resolvePath(abs);
    if (abs === '/') return { node: VIRTUAL_FS['/'], parent: null, name: '/' };

    var parts = abs.split('/').filter(Boolean);
    var current = VIRTUAL_FS['/'];
    var parent = null;
    var name = '/';

    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      if (!current.children || !current.children[part]) {
        return null;
      }
      parent = current;
      name = part;
      current = current.children[part];
    }
    return { node: current, parent: parent, name: name, path: abs };
  }

  function resolvePath(p) {
    if (!p || p.length === 0) return cwd;
    var parts = (p.startsWith('/') ? '' : cwd + '/').split('/').concat(p.split('/'));
    var res = [];

    for (var i = 0; i < parts.length; i++) {
      var part = parts[i].trim();
      if (part === '' || part === '.') continue;
      if (part === '..') {
        if (res.length > 0) res.pop();
        continue;
      }
      res.push(part);
    }
    return '/' + res.join('/');
  }

  function getPrompt() {
    var displayPath = cwd === HOME ? '~' : (cwd.startsWith(HOME) ? '~' + cwd.slice(HOME.length) : cwd);
    return '<span class="prompt-host">' + USER + '</span><span class="prompt-symbol">@</span><span class="prompt-host">' + HOST + '</span><span class="prompt-symbol">:</span><span class="prompt-path">' + displayPath + '</span><span class="prompt-symbol">$ </span>';
  }

  function showPrompt() {
    promptEl.innerHTML = getPrompt();
  }

  function print(text, type) {
    var div = document.createElement('div');
    if (type) {
      div.className = 'output-block ' + type;
    } else {
      div.className = 'output-block';
    }
    if (typeof text === 'string' && text.indexOf('<') !== -1) {
      div.innerHTML = text;
    } else {
      div.textContent = text;
    }
    output.appendChild(div);
    autoScroll();
  }

  function printHtml(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    output.appendChild(div);
    autoScroll();
  }

  function autoScroll() {
    if (output) output.scrollTop = output.scrollHeight;
  }

  function showLine(raw) {
    var div = document.createElement('div');
    div.innerHTML = getPrompt() + escapeHtml(raw);
    output.appendChild(div);
    autoScroll();
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function matchGlob(pattern, entries) {
    if (pattern.indexOf('*') === -1 && pattern.indexOf('?') === -1) {
      if (entries.indexOf(pattern) !== -1) return [pattern];
      return [];
    }
    var regexStr = '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$';
    var regex = new RegExp(regexStr);
    return entries.filter(function (e) { return regex.test(e); });
  }

  function listDirContents(node, showHidden, longFormat) {
    if (!node || !node.children) return [];
    var names = Object.keys(node.children);
    var items = [];
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (!showHidden && name.startsWith('.')) continue;
      var child = node.children[name];
      var type = child.type === 'dir' ? 'd' : '-';
      var perms = child.type === 'dir' ? 'rwxr-xr-x' : 'rw-r--r--';
      var size = child.type === 'dir' ? 4096 : (typeof child.content === 'function' ? child.content().length : 0);
      var date = 'Jun 29 14:00';
      if (longFormat) {
        items.push({ name: name, type: child.type, line: type + perms + ' 1 rainier rainier ' + String(size).padStart(8) + ' ' + date + ' ' + name });
      } else {
        items.push({ name: name, type: child.type });
      }
    }
    return items;
  }

  function getCompletionMatches(input) {
    if (!input) return [];
    var lastSpace = input.lastIndexOf(' ');
    var token = lastSpace === -1 ? input : input.slice(lastSpace + 1);
    var tokenDir = token.lastIndexOf('/') !== -1 ? token.slice(0, token.lastIndexOf('/') + 1) : '';
    var lastPart = token.slice(tokenDir.length);
    var searchPath = tokenDir || '.';

    var resolved;
    if (searchPath.startsWith('/')) {
      resolved = getNode(searchPath);
    } else {
      resolved = getNode(cwd + '/' + searchPath);
    }

    if (!resolved || !resolved.node || resolved.node.type !== 'dir') return [];
    var entries = Object.keys(resolved.node.children || {});
    var matches = [];
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].indexOf(lastPart) === 0) {
        var fullPath = tokenDir + entries[i];
        var info = getNode(fullPath);
        if (info && info.node && info.node.type === 'dir') {
          matches.push(fullPath + '/');
        } else {
          matches.push(fullPath + ' ');
        }
      }
    }
    return matches;
  }

  var commands = {};

  commands.help = function () {
    var html = '<div class="help-table">';
    html += '<div class="help-section">General</div>';
    var general = [
      ['help', 'Show this help message'],
      ['clear', 'Clear the terminal screen'],
      ['history', 'Show command history (history -c clears)'],
      ['exit', 'Return to the main site'],
      ['Arrow Up / Down', 'Previous / next command']
    ];
    general.forEach(function (c) {
      html += '<div class="help-row"><span class="help-command">' + c[0] + '</span><span class="help-desc">' + c[1] + '</span></div>';
    });
    html += '<div class="help-section">File System</div>';
    var fsCmds = [
      ['ls', 'List directory contents'],
      ['cd', 'Change directory (cd - goes back one step)'],
      ['pwd', 'Print working directory'],
      ['cat', 'Display file contents'],
      ['grep', 'Search for lines in a file'],
      ['head / tail', 'First or last lines of a file'],
      ['wc', 'Count lines, words and characters'],
      ['sort', 'Sort the lines of a file'],
      ['mkdir', 'Create a directory'],
      ['touch', 'Create an empty file'],
      ['rm', 'Remove a file (rm -r for directories)']
    ];
    fsCmds.forEach(function (c) {
      html += '<div class="help-row"><span class="help-command">' + c[0] + '</span><span class="help-desc">' + c[1] + '</span></div>';
    });
    html += '<div class="help-section">System</div>';
    var sysCmds = [
      ['date', 'Show current date and time'],
      ['whoami', 'Display current user'],
      ['uname', 'Print system information'],
      ['echo', 'Display text ($VAR expands)'],
      ['who', 'Show who is logged in'],
      ['man', 'Show a manual page'],
      ['which', 'Locate a command'],
      ['ps / df / free', 'Process, disk and memory info'],
      ['uptime / hostname / id', 'System details'],
      ['fastfetch', 'Show a system overview'],
      ['sudo', 'Run a command as root']
    ];
    sysCmds.forEach(function (c) {
      html += '<div class="help-row"><span class="help-command">' + c[0] + '</span><span class="help-desc">' + c[1] + '</span></div>';
    });
    html += '<div class="help-section">Environment</div>';
    var envCmds = [
      ['export NAME=VALUE', 'Set a variable (export MOTION=off)'],
      ['env / printenv', 'List environment variables'],
      ['unset NAME', 'Remove a variable']
    ];
    envCmds.forEach(function (c) {
      html += '<div class="help-row"><span class="help-command">' + c[0] + '</span><span class="help-desc">' + c[1] + '</span></div>';
    });
    html += '<div class="help-section">Portfolio</div>';
    var portCmds = [
      ['about', 'Display information about me']
    ];
    portCmds.forEach(function (c) {
      html += '<div class="help-row"><span class="help-command">' + c[0] + '</span><span class="help-desc">' + c[1] + '</span></div>';
    });
    html += '</div>';
    printHtml(html);
    return '';
  };

  commands.about = function () {
    return 'Hi! I\'m Rainier, a high school student passionate about technology and engineering. I build projects that solve real-world problems, compete in STEM olympiads, and write technical guides on Instructables.';
  };

  commands.echo = function (args) {
    return args.join(' ').replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, function (match, name) {
      if (name === 'PWD') return cwd;
      if (Object.prototype.hasOwnProperty.call(ENV, name)) return ENV[name];
      return match;
    });
  };

  commands.date = function () {
    var now = new Date();
    return now.toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/,/g, '');
  };

  commands.whoami = function () { return USER; };

  commands.uname = function (args) {
    if (args[0] === '-a') {
      return 'Linux portfolio 6.1.0 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux';
    }
    return 'Linux';
  };

  commands.pwd = function () { return cwd; };

  commands.ls = function (args) {
    var targetPath = '.';
    var showHidden = false;
    var longFormat = false;

    for (var i = 0; i < args.length; i++) {
      if (args[i].indexOf('-') === 0 && args[i].length > 1) {
        var flags = args[i].replace(/^-+/, '');
        for (var f = 0; f < flags.length; f++) {
          if (flags[f] === 'l') longFormat = true;
          else if (flags[f] === 'a') showHidden = true;
        }
      }
      else if (args[i] === '.' && targetPath === '.') { }
      else if (args[i] === '..') { targetPath = args[i]; }
      else if (args[i].indexOf('-') !== 0) { targetPath = args[i]; }
    }

    var resolved;
    if (targetPath === '.' || targetPath === '') {
      resolved = getNode(cwd);
    } else if (targetPath === '..') {
      resolved = getNode(cwd + '/..');
    } else if (targetPath.startsWith('/')) {
      resolved = getNode(targetPath);
    } else {
      resolved = getNode(cwd + '/' + targetPath);
    }

    if (!resolved) {
      return 'ls: cannot access \'' + targetPath + '\': No such file or directory';
    }

    if (resolved.node.type !== 'dir') {
      return resolved.name;
    }

    var entries = listDirContents(resolved.node, showHidden, longFormat);
    if (entries.length === 0) return '';

    if (longFormat) {
      print('total ' + entries.length);
      entries.forEach(function (e) {
        print(e.line);
      });
      return '';
    } else {
      var lines = [];
      var currentLine = [];
      entries.forEach(function (e) {
        var cls = e.type === 'dir' ? 'ls-dir' : 'ls-file';
        currentLine.push('<span class="' + cls + '">' + e.name + '</span>');
        if (currentLine.length >= 5) {
          lines.push(currentLine.join('  '));
          currentLine = [];
        }
      });
      if (currentLine.length > 0) lines.push(currentLine.join('  '));
      lines.forEach(function (l) { printHtml(l); });
      return '';
    }
  };

  commands.cd = function (args) {
    var target = args[0];
    if (!target || target === '~' || target === '') {
      prevCwd = cwd;
      cwd = HOME;
      ENV.PWD = cwd;
      return '';
    }

    if (target === '-') {
      if (!prevCwd) return '';
      var back = prevCwd;
      prevCwd = cwd;
      cwd = back;
      ENV.PWD = cwd;
      return cwd;
    }

    var resolved;
    if (target.startsWith('/')) {
      resolved = getNode(target);
    } else if (target.startsWith('~')) {
      resolved = getNode(HOME + target.slice(1));
    } else {
      resolved = getNode(cwd + '/' + target);
    }

    if (!resolved) {
      return 'cd: ' + target + ': No such file or directory';
    }

    if (resolved.node.type !== 'dir') {
      return 'cd: ' + target + ': Not a directory';
    }

    prevCwd = cwd;
    cwd = resolved.path;
    if (cwd === '') cwd = '/';
    ENV.PWD = cwd;
    return '';
  };

  commands.cat = function (args) {
    if (!args || args.length === 0) {
      return 'cat: missing operand';
    }

    var outputLines = [];
    for (var i = 0; i < args.length; i++) {
      var target = args[i];
      var resolved;
      if (target.startsWith('/')) {
        resolved = getNode(target);
      } else {
        resolved = getNode(cwd + '/' + target);
      }

      if (!resolved) {
        outputLines.push('cat: ' + target + ': No such file or directory');
        continue;
      }

      if (resolved.node.type === 'dir') {
        outputLines.push('cat: ' + target + ': Is a directory');
        continue;
      }

      if (resolved.node.type === 'file') {
        outputLines.push(resolved.node.content());
      }
    }
    return outputLines.join('\r\n');
  };

  commands.clear = function () {
    if (output) output.innerHTML = '';
    return '';
  };

  commands.history = function (args) {
    if (args[0] === '-c') { history.length = 0; historyIndex = 0; return ''; }
    if (history.length === 0) return 'No commands in history.';
    return history.map(function (cmd, i) { return '  ' + (i + 1) + '  ' + cmd; }).join('\r\n');
  };

  commands.exit = function () {
    window.location.href = 'index.html';
    return '';
  };

  commands.who = function () {
    var now = new Date();
    var dateStr = now.toISOString().split('T')[0];
    var timeStr = now.toTimeString().split(' ')[0].slice(0, 5);
    return USER + ' pts/1        ' + dateStr + ' ' + timeStr + ' (terminal)';
  };

  commands.hostname = function () { return HOST; };

  commands.id = function () { return 'uid=1000(' + USER + ') gid=1000(' + USER + ') groups=1000(' + USER + '),27(sudo),44(video)'; };

  commands.uptime = function () {
    var now = new Date();
    return ' ' + now.toTimeString().slice(0, 8) + ' up 3 days,  2:14,  1 user,  load average: 0.42, 0.31, 0.28';
  };

  commands.free = function () {
    return '               total        used        free      shared  buff/cache   available\n' +
           'Mem:            7862        2341        3120         212        2401        5108\n' +
           'Swap:           2047           0        2047';
  };

  commands.df = function () {
    return 'Filesystem      Size  Used Avail Use% Mounted on\n' +
           '/dev/vda1        40G  6.2G   32G  17% /\n' +
           'tmpfs           3.9G     0  3.9G   0% /dev/shm';
  };

  commands.ps = function () {
    return '    PID TTY          TIME CMD\n' +
           '   1024 pts/0    00:00:00 bash\n' +
           '   2048 pts/0    00:00:00 ps';
  };

  commands.sudo = function () {
    print(USER + ' is not in the sudoers file. This incident will be reported.', 'error');
    return '';
  };

  commands.which = function (args) {
    if (!args.length) return '';
    return args.map(function (name) {
      return commands[name] ? '/usr/bin/' + name : name + ' not found';
    }).join('\n');
  };

  commands.fastfetch = function () {
    return USER + '@' + HOST + '\n' +
      '-----------\n' +
      'OS: portfolio linux 6.1.0 x86_64\n' +
      'Shell: bash 5.1.16\n' +
      'Terminal: web-term\n' +
      'CPU: Virtual @ 3.20GHz\n' +
      'Memory: 2341MiB / 7862MiB\n' +
      'Uptime: 3 days, 2 hours, 14 mins';
  };

  commands.neofetch = function () { return commands.fastfetch(); };

  function readFileFor(cmd, target) {
    var resolved;
    if (target.startsWith('/')) resolved = getNode(target);
    else resolved = getNode(cwd + '/' + target);
    if (!resolved) { print(cmd + ': ' + target + ': No such file or directory', 'error'); return null; }
    if (resolved.node.type === 'dir') { print(cmd + ': ' + target + ': Is a directory', 'error'); return null; }
    return resolved.node.content().split('\n');
  }

  commands.grep = function (args) {
    var ignoreCase = false;
    var pattern = null;
    var files = [];
    args.forEach(function (a) {
      if (a === '-i') ignoreCase = true;
      else if (pattern === null) pattern = a;
      else files.push(a);
    });
    if (pattern === null) return 'Usage: grep [-i] PATTERN FILE...';
    if (!files.length) return 'grep: missing file operand';
    var out = [];
    files.forEach(function (f) {
      var lines = readFileFor('grep', f);
      if (!lines) return;
      var needle = ignoreCase ? pattern.toLowerCase() : pattern;
      lines.forEach(function (line) {
        var hay = ignoreCase ? line.toLowerCase() : line;
        if (hay.indexOf(needle) !== -1) out.push(line);
      });
    });
    return out.join('\n');
  };

  function headTail(cmd, args, fromTop) {
    var n = 10;
    var file = null;
    for (var i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) { n = parseInt(args[++i], 10) || 10; }
      else if (args[i].charAt(0) === '-' && !isNaN(parseInt(args[i].slice(1), 10))) { n = parseInt(args[i].slice(1), 10); }
      else file = args[i];
    }
    if (!file) return 'Usage: ' + cmd + ' [-n COUNT] FILE';
    var lines = readFileFor(cmd, file);
    if (!lines) return '';
    return (fromTop ? lines.slice(0, n) : lines.slice(-n)).join('\n');
  }

  commands.head = function (args) { return headTail('head', args, true); };

  commands.tail = function (args) { return headTail('tail', args, false); };

  commands.wc = function (args) {
    var file = null;
    for (var i = 0; i < args.length; i++) { if (args[i].charAt(0) !== '-') file = args[i]; }
    if (!file) return 'Usage: wc FILE';
    var lines = readFileFor('wc', file);
    if (!lines) return '';
    var text = lines.join('\n');
    var words = text.split(/\s+/).filter(Boolean).length;
    return String(lines.length).padStart(7) + String(words).padStart(8) + String(text.length).padStart(8) + ' ' + file;
  };

  commands.sort = function (args) {
    var file = null;
    args.forEach(function (a) { if (a.charAt(0) !== '-') file = a; });
    if (!file) return 'Usage: sort FILE';
    var lines = readFileFor('sort', file);
    if (!lines) return '';
    return lines.slice().sort().join('\n');
  };

  function parentOf(absPath) {
    var idx = absPath.lastIndexOf('/');
    return idx <= 0 ? '/' : absPath.slice(0, idx);
  }

  function resolveUserPath(t) {
    return t.startsWith('/') ? resolvePath(t) : resolvePath(cwd + '/' + t);
  }

  commands.mkdir = function (args) {
    var targets = args.filter(function (a) { return a.charAt(0) !== '-'; });
    if (!targets.length) return 'mkdir: missing operand';
    var errors = [];
    targets.forEach(function (t) {
      var abs = resolveUserPath(t);
      if (getNode(abs)) { errors.push("mkdir: cannot create directory '" + t + "': File exists"); return; }
      var parent = getNode(parentOf(abs));
      if (!parent || parent.node.type !== 'dir') { errors.push("mkdir: cannot create directory '" + t + "': No such file or directory"); return; }
      parent.node.children[abs.split('/').pop()] = { type: 'dir', children: {} };
    });
    if (errors.length) print(errors.join('\n'), 'error');
    return '';
  };

  commands.touch = function (args) {
    var targets = args.filter(function (a) { return a.charAt(0) !== '-'; });
    if (!targets.length) return 'touch: missing file operand';
    var errors = [];
    targets.forEach(function (t) {
      var abs = resolveUserPath(t);
      if (getNode(abs)) return;
      var parent = getNode(parentOf(abs));
      if (!parent || parent.node.type !== 'dir') { errors.push("touch: cannot touch '" + t + "': No such file or directory"); return; }
      parent.node.children[abs.split('/').pop()] = { type: 'file', content: function () { return ''; } };
    });
    if (errors.length) print(errors.join('\n'), 'error');
    return '';
  };

  commands.rm = function (args) {
    var recursive = false;
    var force = false;
    var targets = [];
    args.forEach(function (a) {
      if (a === '-r' || a === '-R' || a === '-rf' || a === '-fr') { recursive = true; if (a.length > 2) force = true; }
      else if (a === '-f') { force = true; }
      else targets.push(a);
    });
    if (!targets.length) return 'rm: missing operand';
    var errors = [];
    targets.forEach(function (t) {
      var abs = resolveUserPath(t);
      if (abs === '/') { errors.push("rm: it is dangerous to operate recursively on '/'"); return; }
      var info = getNode(abs);
      if (!info || !info.parent) { if (!force) errors.push("rm: cannot remove '" + t + "': No such file or directory"); return; }
      if (info.node.type === 'dir' && !recursive) { errors.push("rm: cannot remove '" + t + "': Is a directory"); return; }
      delete info.parent.children[info.name];
    });
    if (errors.length) print(errors.join('\n'), 'error');
    return '';
  };

  var MANUALS = {
    ls: 'ls - list directory contents\n\nSYNOPSIS\n       ls [-a] [-l] [FILE]\n\nDESCRIPTION\n       List information about files in the current directory.',
    cd: 'cd - change the shell working directory\n\nSYNOPSIS\n       cd [DIR]\n\nDESCRIPTION\n       Change directory to DIR. cd - returns to the previous directory.',
    cat: 'cat - concatenate files and print on the standard output\n\nSYNOPSIS\n       cat FILE...\n\nDESCRIPTION\n       Display the contents of each given FILE.',
    grep: 'grep - print lines matching a pattern\n\nSYNOPSIS\n       grep [-i] PATTERN FILE...\n\nDESCRIPTION\n       Search FILEs for lines containing PATTERN. -i ignores case.',
    export: 'export - set an environment variable\n\nSYNOPSIS\n       export NAME=VALUE\n\nDESCRIPTION\n       Create or update a variable. export MOTION=off turns animations off for the whole site and remembers it.',
    MOTION: 'MOTION - animation environment variable\n\nVALUES\n       on | off\n\nDESCRIPTION\n       Controls site animations. Set with export MOTION=off, read with printenv MOTION, reset with unset MOTION. The settings panel (Ctrl + ,) on site pages controls the same preference.',
    history: 'history - display the command history\n\nSYNOPSIS\n       history [-c]\n\nDESCRIPTION\n       List past commands with numbers. -c clears the list.',
    rm: 'rm - remove files or directories\n\nSYNOPSIS\n       rm [-r] FILE...\n\nDESCRIPTION\n       Remove file entries. Removing a directory requires -r.',
    mkdir: 'mkdir - make directories\n\nSYNOPSIS\n       mkdir DIR...\n\nDESCRIPTION\n       Create each DIR. Fails when it already exists.',
    touch: 'touch - update file timestamps\n\nSYNOPSIS\n       touch FILE...\n\nDESCRIPTION\n       Create empty FILEs when they do not exist.'
  };

  commands.man = function (args) {
    if (!args.length) return 'What manual page do you want?';
    var page = MANUALS[args[0]];
    if (!page) return 'No manual entry for ' + args[0];
    return page;
  };

  commands.export = function (args) {
    if (!args.length) {
      return Object.keys(ENV).map(function (k) {
        return 'declare -x ' + k + '="' + (k === 'PWD' ? cwd : ENV[k]) + '"';
      }).join('\n');
    }
    var errors = [];
    args.forEach(function (a) {
      var eq = a.indexOf('=');
      if (eq === -1) { errors.push('bash: export: `' + a + "': not a valid identifier"); return; }
      var name = a.slice(0, eq);
      var value = a.slice(eq + 1);
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) { errors.push('bash: export: `' + name + "': not a valid identifier"); return; }
      if (name === 'MOTION') {
        if (value === 'on' || value === 'off') applyMotion(value, true);
        else errors.push('bash: export: MOTION: must be on or off');
        return;
      }
      ENV[name] = value;
    });
    if (errors.length) print(errors.join('\n'), 'error');
    return '';
  };

  commands.env = function () { return commands.printenv([]); };

  commands.printenv = function (args) {
    if (args[0]) {
      var value = args[0] === 'PWD' ? cwd : ENV[args[0]];
      return value === undefined ? '' : String(value);
    }
    return Object.keys(ENV).map(function (k) {
      return k + '=' + (k === 'PWD' ? cwd : ENV[k]);
    }).join('\n');
  };

  commands.unset = function (args) {
    args.forEach(function (a) {
      if (a === 'MOTION') {
        try { localStorage.removeItem('motion'); } catch (e) { }
        applyMotion('on', false);
        return;
      }
      if (a !== 'USER' && a !== 'HOME' && ENV.hasOwnProperty(a)) delete ENV[a];
    });
    return '';
  };

  function motd() {
    var now = new Date();
    var dateStr = now.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/,/g, '');
    printHtml('<span class="motd-line">Welcome to the Portfolio Terminal Emulator</span>');
    printHtml('<span class="motd-line">Linux 6.1.0 on x86_64</span>');
    printHtml('<span class="motd-line info">' + dateStr + '</span>');
    printHtml('<span class="motd-line">&nbsp;</span>');
    printHtml('<span class="motd-line info">Type <span class="motd-cmd">help</span> for available commands</span>');
    printHtml('<span class="motd-line info">Type <span class="motd-cmd">ls</span> to browse the virtual filesystem</span>');
    printHtml('<span class="motd-line info">Animations: <span class="motd-cmd">export MOTION=off</span> (syncs with the site)</span>');
    printHtml('<span class="motd-line">&nbsp;</span>');
  }

  function showPromptLine() {
    if (promptEl) showPrompt();
  }

  function executeCommand(raw) {
    showLine(raw);

    if (!raw || !raw.trim()) return;

    var parts = raw.trim().match(/(?:\.|[^\s"])+|"(?:\.|[^"])*"/g) || [];
    parts = parts.map(function (p) {
      if (p.startsWith('"') && p.endsWith('"')) return p.slice(1, -1);
      return p;
    });

    var cmdName = parts[0].toLowerCase();
    var args = parts.slice(1);

    if (commands[cmdName]) {
      var result = commands[cmdName](args);
      if (result && result !== '') {
        if (result.indexOf('<') !== -1 && result.indexOf('>') !== -1) {
          printHtml(result);
        } else {
          print(result);
        }
      }
    } else {
      print('bash: ' + cmdName + ': command not found', 'error');
    }
  }

  function stepHistory(delta) {
    if (history.length === 0) return;
    var next = historyIndex + delta;
    if (next < 0) next = 0;
    if (next > history.length) next = history.length;
    historyIndex = next;
    input.value = historyIndex === history.length ? '' : history[historyIndex];
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var raw = input.value;
      if (raw.trim()) {
        history.push(raw.trim());
        historyIndex = history.length;
      }
      executeCommand(raw);
      input.value = '';
      showPrompt();
      autoScroll();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      stepHistory(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      stepHistory(1);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      var val = input.value;
      if (!val.trim()) return;
      if (val.indexOf(' ') === -1) {
        var cmdMatches = Object.keys(commands).filter(function (name) { return name.indexOf(val) === 0; });
        if (cmdMatches.length === 1) {
          input.value = cmdMatches[0] + ' ';
        } else if (cmdMatches.length > 1) {
          print(cmdMatches.join('  '));
          showPrompt();
        }
        return;
      }
      var matches = getCompletionMatches(val);
      if (matches.length === 1) {
        var lastSpace = val.lastIndexOf(' ');
        var head = lastSpace === -1 ? '' : val.slice(0, lastSpace + 1);
        input.value = head + matches[0];
      } else if (matches.length > 1) {
        print(matches.join('  '));
        showPrompt();
        input.value = val;
      }
    } else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      print('^C');
      input.value = '';
      showPrompt();
      autoScroll();
    } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      commands.clear();
      showPrompt();
    } else if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!input.value) {
        window.location.href = 'index.html';
      }
    }
  }

  function init() {
    if (!input) return;
    historyIndex = history.length;

    motd();
    showPrompt();
    input.focus();

    input.addEventListener('keydown', handleKeydown);

    output.addEventListener('click', function () {
      if (window.getSelection().toString().length === 0) {
        input.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (window.getSelection().toString().length > 0) return;
      if (e.target.closest('.terminal')) {
        input.focus();
      }
    });
  }

  init();
})();
