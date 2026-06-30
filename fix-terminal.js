var fs = require('fs');
var content = fs.readFileSync('js/terminal.js', 'utf8');
var original = content;

// Fix 1: VIRTUAL_FS about content - I'm with double backslash
content = content.split("'Hi! I\\\\'m Rainier, a high school student passionate about technology, science, and innovation. I enjoy creating projects that solve real-world problems.'").join("'Hi! I\\'m Rainier, a high school student passionate about technology, science, and innovation. I enjoy creating projects that solve real-world problems.'");

// Fix 2: VIRTUAL_FS contact - \\n to actual \n newlines  
content = content.split("'GitHub:       https://github.com/Rainier-PS\\\\nInstagram:    https://instagram.com/rainier_ps\\\\nInstructables: https://www.instructables.com/member/Rainier-PS/\\\\nLocation:     Semarang, Indonesia'").join("'GitHub:       https://github.com/Rainier-PS\\nInstagram:    https://instagram.com/rainier_ps\\nInstructables: https://www.instructables.com/member/Rainier-PS/\\nLocation:     Semarang, Indonesia'");

// Fix 3: VIRTUAL_FS experience - \\n to actual \n newlines
content = content.split("'Garuda Hacks 7.0 Volunteer\\\\nHack Club Member\\\\nClub Leader - Hack Club Binus School Semarang\\\\nHack the Hat Elective Member (Raspberry Pi & Sense HAT)\\\\nSTEM Club Member\\\\nDigital Journalism Elective Member\\\\nRevoU SECC - Coding Camp'").join("'Garuda Hacks 7.0 Volunteer\\nHack Club Member\\nClub Leader - Hack Club Binus School Semarang\\nHack the Hat Elective Member (Raspberry Pi & Sense HAT)\\nSTEM Club Member\\nDigital Journalism Elective Member\\nRevoU SECC - Coding Camp'");

// Fix 4: ls error message line - the double backslash before quotes
content = content.split("return 'ls: cannot access \\\\'' + targetPath + '\\\\'': No such file or directory';").join("return 'ls: cannot access \\' + targetPath + '\\': No such file or directory';");

// Fix 5: commands.about - I'm with double backslash  
content = content.split("'Hi! I\\\\'m Rainier, a high school student passionate about technology and engineering. I build projects that solve real-world problems, compete in STEM olympiads, and write technical guides on Instructables.'").join("'Hi! I\\'m Rainier, a high school student passionate about technology and engineering. I build projects that solve real-world problems, compete in STEM olympiads, and write technical guides on Instructables.'");

if (content !== original) {
  fs.writeFileSync('js/terminal.js', content, 'utf8');
  console.log('File updated successfully!');
} else {
  console.log('No changes were made - patterns did not match.');
}
