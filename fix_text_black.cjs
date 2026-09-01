const fs = require('fs');
let content = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf-8');

// We only want to fix the ones in the Modals, so let's split the file or just do replace
content = content.replace(/<span className="font-bold text-black">\{a.rank\}<\/span>/g, '<span className="font-bold">{a.rank}</span>');
content = content.replace(/<h3 className="text-base font-black text-black flex items-center space-x-2">/g, '<h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">');
content = content.replace(/<span className="font-bold text-black text-xs">/g, '<span className="font-bold text-slate-900 dark:text-white text-xs">');

// Fix input fields
content = content.replace(/className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300  bg-white  text-black outline-none focus:border-amber-500 shadow-xs"/g, 'className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-amber-500 shadow-xs"');

// And let's fix the checkbox style to ensure it has no weird white border
content = content.replace(/className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"/g, 'className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer border-slate-300 dark:border-slate-600 dark:bg-slate-800"');

fs.writeFileSync('src/components/NightCountStateView.tsx', content, 'utf-8');
console.log("Fixed text-black in Modals");
