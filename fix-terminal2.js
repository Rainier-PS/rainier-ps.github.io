var fs = require('fs');
var content = fs.readFileSync('js/terminal.js', 'utf8');

// Find the line with the ls error message
var lines = content.split('\n');
for (var i = 0; i < lines.length; i++) {
  if (lines[i].indexOf('cannot access') !== -1 && lines[i].indexOf('No such file or directory') !== -1) {
    var line = lines[i];
    console.log('Line ' + (i+1) + ' found. Characters:');
    for (var j = 0; j < line.length; j++) {
      console.log('  [' + j + '] char=' + line[j] + ' code=' + line.charCodeAt(j));
    }
    
    // We need to find the two positions where we have \\' (2 backslashes + quote)
    // and change them to \' (1 backslash + quote)
    
    // Looking for pattern: access \\'' + targetPath + '\\'': No
    // We need:            access \'' + targetPath + '\': No
    
    // Replace \\' with \' at both positions
    // First, find the substring we need to change
    var searchStr = "' + targetPath + '";
    var idx = line.indexOf(searchStr);
    if (idx !== -1) {
      // Check what's before and after
      var before = line.substring(idx - 20, idx);
      var after = line.substring(idx + searchStr.length, idx + searchStr.length + 25);
      console.log('\nContext before:', JSON.stringify(before));
      console.log('Context after:', JSON.stringify(after));
      
      // Build the new line
      // Old: 'ls: cannot access \\' + targetPath + '\\': No such file or directory'
      // New: 'ls: cannot access \' + targetPath + '\': No such file or directory'
      
      // Find the start and end of the return statement
      var startQuote = line.indexOf("return 'ls: cannot access");
      if (startQuote === -1) continue;
      
      var returnPart = line.substring(0, startQuote) + "return ";
      var rest = line.substring(startQuote + 7); // skip "return "
      
      // The rest should be: 'ls: cannot access \' + targetPath + '\': No such file or directory';
      
      // Manual replacement approach - just fix the two bad patterns
      // Pattern 1: \\' (2 backslashes + 1 quote) between 'access ' and ' + targetPath'
      // Pattern 2: '\\' (quote + 2 backslashes + 1 quote) after 'targetPath + ' 
      
      // Replace the whole return statement
      var oldReturn = line.substring(line.indexOf("return '"));
      var newReturn = "return 'ls: cannot access \\'' + targetPath + '\\': No such file or directory';";
      
      console.log('\nOld line:', JSON.stringify(line));
      console.log('New return part:', JSON.stringify(newReturn));
      
      // Build the new line
      var newLine = line.substring(0, line.indexOf("return '")) + newReturn;
      console.log('New line:', JSON.stringify(newLine));
      
      // Replace in lines array
      lines[i] = newLine;
      break;
    }
  }
}

var result = lines.join('\n');
fs.writeFileSync('js/terminal.js', result, 'utf8');
console.log('\nFile written. Checking syntax...');
