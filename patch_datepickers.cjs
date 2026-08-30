const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetFiles = [];
walkDir('src/components', (filePath) => {
  if (filePath.endsWith('.tsx')) {
    targetFiles.push(filePath);
  }
});

targetFiles.forEach(file => {
  if (file.includes('DateNavigator')) return;

  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('type="date"')) {
    console.log('Processing:', file);
    
    // Replace imports
    if (!content.includes('import { DateNavigator }')) {
      const depth = file.split('/').length - 2; // src/components is depth 0
      const prefix = depth === 0 ? './' : '../'.repeat(depth);
      const importStatement = `import { DateNavigator } from '${prefix}DateNavigator';`;
      
      let lines = content.split('\n');
      let lastImportIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) lastImportIdx = i;
      }
      
      if (lastImportIdx >= 0) {
        lines.splice(lastImportIdx + 1, 0, importStatement);
      } else {
        lines.unshift(importStatement);
      }
      content = lines.join('\n');
    }
    
    // Replace <input \n ... type="date" ... /> with DateNavigator
    // We will do this carefully using regex that accounts for spaces and newlines
    
    let regex = /<input([^>]*?)type="date"([^>]*?)\/?>/gs;
    content = content.replace(regex, (match, before, after) => {
      let attrs = before + after;
      
      // We need to convert onChange={(e) => setSomething(e.target.value)} 
      // into onDateChange={(val) => setSomething(val)} or just simulate event
      
      let newAttrs = attrs;
      
      // Look for onChange={(e) => ... e.target.value ... }
      // This is hard to do perfectly with regex because it might be multiline.
      
      // Let's modify DateNavigator to accept onChange instead, and synthesize the event object
      return `<DateNavigator${attrs}/>`;
    });

    fs.writeFileSync(file, content);
  }
});
