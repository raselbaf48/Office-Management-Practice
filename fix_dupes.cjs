const fs = require('fs');

const files = [
  'src/components/NightCountStateView.tsx',
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/PrintableNightCountModal.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Clean up duplicated dark mode classes
    content = content.replace(/dark:bg-slate-900 dark:bg-slate-900/g, 'dark:bg-slate-900');
    content = content.replace(/dark:bg-slate-900 dark:bg-slate-800/g, 'dark:bg-slate-800');
    content = content.replace(/bg-white dark:bg-slate-900 \/50/g, 'bg-white dark:bg-slate-900/50');

    fs.writeFileSync(file, content, 'utf-8');
  }
});
console.log("Cleaned up duplicated dark mode classes.");
