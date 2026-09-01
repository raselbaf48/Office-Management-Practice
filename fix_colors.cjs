const fs = require('fs');

const files = [
  'src/components/NightCountStateView.tsx',
  'src/components/PrintableNightCountModal.tsx',
  'src/components/ParadeStateFormattedView.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/bg-slate-50 \/50/g, 'bg-slate-50 dark:bg-slate-800/50');
    content = content.replace(/border-slate-200 "/g, 'border-slate-200 dark:border-slate-800"');
    fs.writeFileSync(file, content, 'utf-8');
  }
});
console.log("Fixed missing dark mode colors.");
