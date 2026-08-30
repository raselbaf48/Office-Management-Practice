const fs = require('fs');

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('<input type="date"')) return;
  
  let newCode = '';
  let index = 0;
  while (true) {
    let pos = code.indexOf('<input type="date"', index);
    if (pos === -1) {
      newCode += code.substring(index);
      break;
    }
    
    newCode += code.substring(index, pos);
    
    let endPos = pos;
    let inString = false;
    let stringChar = '';
    let inBraces = 0;
    
    while (endPos < code.length) {
      let char = code[endPos];
      
      if (!inBraces && (char === '"' || char === "'")) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (stringChar === char) {
          inString = false;
        }
      }
      
      if (!inString) {
        if (char === '{') inBraces++;
        if (char === '}') inBraces--;
      }
      
      if (!inString && inBraces === 0 && char === '>') {
        break;
      }
      endPos++;
    }
    
    let inputTag = code.substring(pos, endPos + 1);
    let transformed = inputTag.replace('<input type="date"', '<DateNavigator');
    newCode += transformed;
    
    index = endPos + 1;
  }
  
  // Add import
  if (!newCode.includes('import { DateNavigator }')) {
    let depth = file.split('/').length - 2;
    let prefix = depth === 0 ? './' : '../'.repeat(depth);
    
    let lines = newCode.split('\n');
    let lastImport = -1;
    for (let i=0; i<lines.length; i++) {
       if (lines[i].startsWith('import ')) lastImport = i;
    }
    if (lastImport !== -1) {
       lines.splice(lastImport + 1, 0, `import { DateNavigator } from '${prefix}DateNavigator';`);
    } else {
       lines.unshift(`import { DateNavigator } from '${prefix}DateNavigator';`);
    }
    newCode = lines.join('\n');
  }
  
  fs.writeFileSync(file, newCode);
  console.log('Processed:', file);
}

const glob = require('fs').readdirSync;
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

walk('src/components').forEach(f => {
   if (!f.includes('DateNavigator')) processFile(f);
});

