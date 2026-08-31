const fs = require('fs');
let file = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf-8');

file = file.replace(/bg-slate-200 text-slate-700 hover:bg-slate-300/g, "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700");

fs.writeFileSync('src/components/NightCountStateView.tsx', file, 'utf-8');
