const fs = require('fs');

const files = [
  'src/components/NightCountStateView.tsx',
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/PrintableNightCountModal.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Fix the scrollbox background to be much more subtle in dark mode
    content = content.replace(
      /className="max-h-56 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800\/80 border border-slate-200 dark:border-slate-700"/g,
      'className="max-h-56 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50"'
    );

    // Ensure the individual rows in dark mode match the sleek dark theme properly
    content = content.replace(
      /'bg-white dark:bg-slate-900 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 text-slate-800 dark:text-slate-200 font-medium'/g,
      "'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:border-emerald-300 dark:hover:border-emerald-700 text-slate-800 dark:text-slate-200 font-medium'"
    );

    fs.writeFileSync(file, content, 'utf-8');
  }
});
console.log("Fixed scrollbox styling.");
