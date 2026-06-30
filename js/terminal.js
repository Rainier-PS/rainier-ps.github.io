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
  var commandBuffer = '';
  var tabIndex = 0;

  var VIRTUAL_FS = {
    '/': { type: 'dir', children: {
      'home': { type: 'dir', children: {
        'rainier': { type: 'dir', children: {
          'about': { type: 'file', content: function () { return 'Hi! I\'m Rainier, a high school student passionate about technology, science, and innovation. I enjoy creating projects that solve real-world problems.'; } },
          'contact': { type: 'file', content: function () { return 'GitHub:       https://github.com/Rainier-PS\nInstagram:    https://instagram.com/rainier_ps\nInstructables: https://www.instructables.com/member/Rainier-PS/\nLocation:     Semarang, Indonesia'; } },
          'experience': { type: 'file', content: function () { return 'Garuda Hacks 7.0 Volunteer\nHack Club Member\nClub Leader - Hack Club Binus School Semarang\nHack the Hat Elective Member (Raspberry Pi & Sense HAT)\nSTEM Club Member\nDigital Journalism Elective Member\nRevoU SECC - Coding Camp'; } },
          'projects': { type: 'dir', content: 'projects listing', children: {} },
          'publications': { type: 'dir', content: 'publications listing', children: {} },
          'skills': { type: 'dir', children: {
            'programming': { type: 'file', content: function () { return 'Python, JavaScript (ES6+), SQL, Arduino (C/C++), HTML, CSS'; } },
            '3d-printing': { type: 'file', content: function () { return 'Fusion 360 for 3D modeling, KiCad for PCB design, hands-on soldering'; } },
            'languages': { type: 'file', content: function () { return 'English (Fluent), Chinese (Learning), German (Learning), Indonesian (Native)'; } },
            'maths-science': { type: 'file', content: function () { return 'Strong foundation in mathematics and science applied to problem-solving, experiments, research, and technical projects.'; } }
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

  function getCompletionMatches(prefix) {
    if (!prefix) return [];
    var lastPart = prefix.split(/[\\s/]/g).pop();
    var dirPart = prefix.lastIndexOf('/') !== -1 ? prefix.slice(0, prefix.lastIndexOf('/') + 1) : '';
    var searchPath = dirPart || '.';

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
        var fullPath = dirPart + entries[i];
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
      ['history', 'Show command history'],
      ['exit', 'Return to the main site']
    ];
    general.forEach(function (c) {
      html += '<div class="help-row"><span class="help-command">' + c[0] + '</span><span class="help-desc">' + c[1] + '</span></div>';
    });
    html += '<div class="help-section">File System</div>';
    var fsCmds = [
      ['ls', 'List directory contents'],
      ['cd', 'Change directory'],
      ['pwd', 'Print working directory'],
      ['cat', 'Display file contents']
    ];
    fsCmds.forEach(function (c) {
      html += '<div class="help-row"><span class="help-command">' + c[0] + '</span><span class="help-desc">' + c[1] + '</span></div>';
    });
    html += '<div class="help-section">System</div>';
    var sysCmds = [
      ['date', 'Show current date and time'],
      ['whoami', 'Display current user'],
      ['uname', 'Print system information'],
      ['echo', 'Display a line of text'],
      ['who', 'Show who is logged in']
    ];
    sysCmds.forEach(function (c) {
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
    var str = args.join(' ');
    if (str.indexOf('$USER') !== -1) str = str.replace(/\$USER/g, USER);
    if (str.indexOf('$HOSTNAME') !== -1) str = str.replace(/\$HOSTNAME/g, HOST);
    if (str.indexOf('$HOME') !== -1) str = str.replace(/\$HOME/g, HOME);
    if (str.indexOf('$PWD') !== -1) str = str.replace(/\$PWD/g, cwd);
    return str;
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
      cwd = HOME;
      return '';
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

    cwd = resolved.path;
    if (cwd === '') cwd = '/';
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

  commands.history = function () {
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

  function motd() {
    var now = new Date();
    var dateStr = now.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/,/g, '');
    printHtml('<span class="motd-line">Welcome to the Portfolio Terminal Emulator</span>');
    printHtml('<span class="motd-line">Linux 6.1.0 on x86_64</span>');
    printHtml('<span class="motd-line info">' + dateStr + '</span>');
    printHtml('<span class="motd-line">&nbsp;</span>');
    printHtml('<span class="motd-line info">Type <span style="color:#569cd6">help</span> for available commands</span>');
    printHtml('<span class="motd-line info">Type <span style="color:#569cd6">ls</span> to browse the virtual filesystem</span>');
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
      if (history.length === 0) return;
      if (historyIndex > 0) historyIndex--;
      else if (historyIndex === history.length) historyIndex = history.length - 1;
      input.value = history[historyIndex] || '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        historyIndex++;
        input.value = history[historyIndex] || '';
      } else {
        historyIndex = history.length;
        input.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      var val = input.value;
      if (!val.trim()) return;
      var matches = getCompletionMatches(val);
      if (matches.length === 1) {
        var match = matches[0];
        var prefix = val.split(/[\\s/]/g).slice(0, -1).join(' ');
        var lastSlash = val.lastIndexOf('/');
        var dirPart = lastSlash !== -1 ? val.slice(0, lastSlash + 1) : '';
        input.value = prefix + (prefix ? ' ' : '') + dirPart + match.trim();
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
