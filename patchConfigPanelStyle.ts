import fs from 'fs';
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf8');

// Replace the main wrapper border to be cleaner
code = code.replace(
  '<div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm w-full flex flex-col border border-slate-200 dark:border-slate-800">',
  '<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm w-full flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden h-full">'
);

// Better header for the config panel
code = code.replace(
  '<div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">',
  '<div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">'
);
code = code.replace(
  '<h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">',
  '<h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3">'
);

// We should replace `<table className="border-collapse border border-black dark:border-slate-600 bg-white dark:bg-slate-800 text-[10px] w-full shadow-sm text-center">` 
// with something cleaner. 

code = code.replace(
  /border border-black dark:border-slate-600/g,
  'border border-slate-200 dark:border-slate-700'
);

code = code.replace(
  /bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100/g,
  'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300'
);

// Clean up input fields
code = code.replace(
  'className="w-full text-center bg-transparent outline-none font-bold text-slate-800 dark:text-slate-200"',
  'className="w-full text-center bg-transparent outline-none font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700 rounded transition-colors py-1"'
);

// Re-write headers to be less aggressive
code = code.replace(
  /<h4 className="text-center font-bold text-sm underline mb-1 text-slate-800 dark:text-slate-200">/g,
  '<h4 className="font-bold text-sm mb-3 text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">'
);
code = code.replace(
  /<h5 className="text-center font-bold text-xs underline mb-3 text-slate-600 dark:text-slate-400">.*?<\/h5>/g,
  ''
);

// Add better spacing between tables
code = code.replace(
  /<div className="w-full overflow-x-auto mt-8 pb-8">/g,
  '<div className="w-full overflow-x-auto mt-6 pb-2">'
);

// Clean up padding of the main wrapper
code = code.replace(
  '<div className="flex flex-col p-6 space-y-8">',
  '<div className="flex flex-col p-5 space-y-6 overflow-y-auto">'
);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
