const fs = require('fs');
let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf-8');

// Modals
content = content.replace(/<span className="font-bold text-black">\{a.rank\}<\/span>/g, '<span className="font-bold">{a.rank}</span>');
content = content.replace(/<h3 className="text-base font-black text-black flex items-center space-x-2">/g, '<h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">');
content = content.replace(/<span className="font-bold text-black text-xs">/g, '<span className="font-bold text-slate-900 dark:text-white text-xs">');

// Input fields
content = content.replace(/className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300  bg-white  text-black outline-none focus:border-amber-500 shadow-xs"/g, 'className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-amber-500 shadow-xs"');
content = content.replace(/text-black outline-none/g, 'text-slate-900 dark:text-white dark:bg-slate-900 outline-none');

// Checkbox
content = content.replace(/className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"/g, 'className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer border-slate-300 dark:border-slate-600 dark:bg-slate-800"');

// Selected border fix
content = content.replace(
  "isChecked ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-400 text-emerald-950 dark:text-emerald-100 font-bold shadow-xs' :",
  "isChecked ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-300 font-bold shadow-xs' :"
);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content, 'utf-8');
console.log("Fixed ParadeStateFormattedView");
