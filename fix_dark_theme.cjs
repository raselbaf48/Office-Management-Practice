const fs = require('fs');

const files = ['src/components/ParadeStateFormattedView.tsx', 'src/components/DutyRosterPeriodView.tsx', 'src/components/NightCountStateView.tsx', 'src/components/PrintableParadeStateModal.tsx', 'src/components/PrintableNightCountModal.tsx'];

for (const file of files) {
  if(!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf-8');

  // Fix inputs
  content = content.replace(/bg-white text-slate-900 dark:text-white/g, 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white');
  
  // Fix labels for Add Disposal list (like line 2204 in ParadeStateFormattedView)
  content = content.replace(/: 'bg-white border-slate-200 dark:border-slate-700/g, ": 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700");

  fs.writeFileSync(file, content);
}
console.log("Fixed dark theme background classes");
