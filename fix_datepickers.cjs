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
  if (filePath.endsWith('.tsx') && !filePath.includes('DateNavigator')) {
    targetFiles.push(filePath);
  }
});

targetFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('<DateNavigator')) {
    console.log('Fixing:', file);
    
    // Replace `<DateNavigator` back to `<input type="date"`
    content = content.replace(/<DateNavigator/g, '<input type="date"');
    
    // Replace `=/>` back to `=>`
    content = content.replace(/=\/>/g, '=>');
    
    // Remove the import statement
    let lines = content.split('\n');
    lines = lines.filter(line => !line.includes('import { DateNavigator } from'));
    content = lines.join('\n');

    fs.writeFileSync(file, content);
  }
});
