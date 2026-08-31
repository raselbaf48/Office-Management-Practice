const fs = require('fs');
let file = fs.readFileSync('src/components/FlyingWingStateView.tsx', 'utf-8');

// Replace Add Disposal Modal Theme
file = file.replace(
  /<div className="fixed inset-0 z-\[100\] flex items-center justify-center p-4 bg-slate-900\/50 backdrop-blur-sm no-print">\s*<div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-slate-800">/m,
  `<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden text-slate-900 dark:text-white">`
);

// Fix Close button for Add Disposal
file = file.replace(
  /<button onClick=\{\(\) => onCloseAddModal\(\)\} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;<\/button>/g,
  `<button onClick={() => onCloseAddModal()} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-2xl transition-colors">&times;</button>`
);

// Fix Labels and Inputs for Add Disposal
file = file.replace(/text-slate-700 dark:text-slate-300/g, 'text-slate-700 dark:text-slate-400 font-medium');
// Oh wait, inputs
file = file.replace(/className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"/g, 
'className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"');

file = file.replace(/className="w-full p-2 border border-slate-200 rounded-lg"/g, 
'className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"');

// Fix the cancel/save buttons
file = file.replace(/className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200"/g,
'className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"');

file = file.replace(/className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"/g,
'className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all"');


// Replace Edit Prepared By Modal Theme
file = file.replace(
  /<div className="fixed inset-0 z-\[100\] flex items-center justify-center p-4 bg-slate-900\/50 backdrop-blur-sm no-print">\s*<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-slate-800 dark:text-slate-100 p-5">/m,
  `<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm overflow-hidden text-slate-900 dark:text-white p-6 space-y-4">`
);

// Fix Labels and Inputs for Edit Prepared By
file = file.replace(
  /className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg uppercase"/g,
  'className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"'
);

file = file.replace(/className="w-full px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"/g,
'className="w-full px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all"');


fs.writeFileSync('src/components/FlyingWingStateView.tsx', file, 'utf-8');
