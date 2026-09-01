const fs = require('fs');
let content = fs.readFileSync('src/components/AddEditAirmanModal.tsx', 'utf-8');

content = content.replace(
  /: 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'/g,
  ": !livingType ? 'bg-amber-50/40 text-amber-700 dark:text-amber-300 border border-amber-400 dark:border-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'"
);

fs.writeFileSync('src/components/AddEditAirmanModal.tsx', content, 'utf-8');
console.log('Patched living buttons amber styling');
