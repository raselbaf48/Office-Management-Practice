const fs = require('fs');

const files = [
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/PrintableNightCountModal.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');

  // Fix Checkboxes
  content = content.replace(/className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"/g, 'className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer border-slate-300 dark:border-slate-600 dark:bg-slate-800"');
  
  // Fix On Parade Label container
  content = content.replace(/'bg-purple-50 \/40 border-purple-400 text-purple-950  font-bold shadow-xs'/g, "'bg-purple-50 dark:bg-purple-900/30 border-purple-400 dark:border-purple-700 text-purple-950 dark:text-purple-300 font-bold shadow-xs'");
  content = content.replace(/'bg-white  border-slate-200  hover:border-purple-300 text-slate-800  font-medium'/g, "'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 text-slate-800 dark:text-slate-200 font-medium'");
  
  // Fix Existing Disposal container
  content = content.replace(/className="flex items-center justify-between p-2 rounded-lg border border-slate-200\/80  bg-slate-100\/80 \/60 text-xs select-none"/g, 'className="flex items-center justify-between p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/80 dark:bg-slate-800/60 text-xs select-none"');
  content = content.replace(/<span className="truncate text-slate-700 ">/g, '<span className="truncate text-slate-700 dark:text-slate-300">');
  content = content.replace(/<span className="px-2 py-0.5 text-\[10px\] font-bold rounded-md bg-slate-200 text-slate-700  ">/g, '<span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">');

  // Also in ParadeStateFormattedView it might have slight variations:
  content = content.replace(/'bg-purple-50 dark:bg-purple-950\/40 border-purple-400 text-purple-950 dark:text-purple-100 font-bold shadow-xs'/g, "'bg-purple-50 dark:bg-purple-900/30 border-purple-400 dark:border-purple-700 text-purple-950 dark:text-purple-300 font-bold shadow-xs'");
  content = content.replace(/'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-800 dark:text-slate-200 font-medium'/g, "'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 text-slate-800 dark:text-slate-200 font-medium'");
  
  // Ranks text-black removal - already done, but let's check for any remaining
  content = content.replace(/<span className="font-bold text-black">/g, '<span className="font-bold text-slate-900 dark:text-white">');
  
  // Fix the "On Parade" pill in PrintableNightCountModal
  content = content.replace(/<span className="px-2 py-0.5 text-\[10px\] font-extrabold rounded-md bg-emerald-100 text-emerald-800   border border-emerald-200  shrink-0 ml-2">/g, '<span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 ml-2">');

  // Fix button text purple
  content = content.replace(/bg-purple-100 text-purple-700 {3}hover/g, 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover');
  
  fs.writeFileSync(file, content, 'utf-8');
});
console.log("Fixed all modals formatting");
