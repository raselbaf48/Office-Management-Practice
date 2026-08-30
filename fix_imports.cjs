const fs = require('fs');

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
   if (!f.includes('DateNavigator')) {
     let content = fs.readFileSync(f, 'utf8');
     if (content.includes('import { DateNavigator }')) {
       // Remove all lines starting with import { DateNavigator } 
       let lines = content.split('\n');
       lines = lines.filter(line => !line.trim().startsWith('import { DateNavigator }'));
       
       let depth = f.split('/').length - 2;
       let prefix = depth === 0 ? './' : '../'.repeat(depth);
       let imp = `import { DateNavigator } from '${prefix}DateNavigator';`;
       
       lines.unshift(imp);
       fs.writeFileSync(f, lines.join('\n'));
     }
   }
});

