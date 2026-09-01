const fs = require('fs');
let content = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf-8');

content = content.replace(
  "isChecked ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-400 text-emerald-950 dark:text-emerald-100 font-bold shadow-xs' :",
  "isChecked ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-300 font-bold shadow-xs' :"
);

fs.writeFileSync('src/components/NightCountStateView.tsx', content, 'utf-8');
console.log("Fixed emerald border");
