const fs = require('fs');

let content = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf-8');

// The modal container
content = content.replace(
  /<div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200\s*shadow-2xl max-w-xl w-full p-6 space-y-5 relative overflow-hidden">/g,
  '<div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-5 relative overflow-hidden">'
);

// Header elements
content = content.replace(
  /<div className="flex items-start justify-between border-b border-slate-200\s*pb-4">/g,
  '<div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">'
);
content = content.replace(
  /<div className="p-2.5 rounded-xl bg-purple-100\s*text-purple-600\s*border border-purple-200\s*">/g,
  '<div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">'
);
content = content.replace(
  /<h2 className="text-lg font-bold text-black">/g,
  '<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">'
);
content = content.replace(
  /<p className="text-xs text-slate-500\s*mt-0.5">/g,
  '<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">'
);

// Success Msg
content = content.replace(
  /<div className="p-3 bg-emerald-100 \/90 text-emerald-900\s*rounded-xl border border-emerald-300\s*text-xs font-bold animate-fadeIn">/g,
  '<div className="p-3 bg-emerald-100 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs font-bold animate-fadeIn">'
);

// 1. Date Selection Section
content = content.replace(
  /<div className="space-y-2 bg-slate-50 \/50 p-3 rounded-xl border border-slate-200\s*">/g,
  '<div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">'
);
content = content.replace(
  /<label className="text-xs font-bold text-slate-800\s*">/g,
  '<label className="text-xs font-bold text-slate-800 dark:text-slate-200">'
);
content = content.replace(
  /<div className="flex items-center space-x-1 bg-white\s*p-0.5 rounded-lg border border-slate-200\s*text-\[11px\] font-bold">/g,
  '<div className="flex items-center space-x-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold">'
);
content = content.replace(
  /className=\{`px-2.5 py-0.5 rounded-md transition-all cursor-pointer \$\{\n\s*disposalDateMode === 'SINGLE'\n\s*\? 'bg-purple-600 text-white shadow-xs'\n\s*: 'text-slate-600\s*hover:text-black'\n\s*\}`\}/g,
  'className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${disposalDateMode === \'SINGLE\' ? \'bg-purple-600 text-white shadow-xs\' : \'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white\'}`}'
);
content = content.replace(
  /className=\{`px-2.5 py-0.5 rounded-md transition-all cursor-pointer \$\{\n\s*disposalDateMode === 'MULTI'\n\s*\? 'bg-purple-600 text-white shadow-xs'\n\s*: 'text-slate-600\s*hover:text-black'\n\s*\}`\}/g,
  'className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${disposalDateMode === \'MULTI\' ? \'bg-purple-600 text-white shadow-xs\' : \'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white\'}`}'
);
content = content.replace(
  /className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300\s*bg-white\s*text-black outline-none focus:border-purple-500 shadow-xs"/g,
  'className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-purple-500 shadow-xs"'
);
content = content.replace(
  /<span className="text-\[11px\] text-slate-500 font-semibold block mb-1">/g,
  '<span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">'
);

// 2. Select Disposal Category
content = content.replace(
  /className=\{`p-2 rounded-xl text-xs font-bold text-left border transition-all truncate cursor-pointer \$\{\n\s*isSelected\n\s*\? 'ring-2 ring-purple-500 border-purple-500 bg-purple-50 \/40 text-purple-900\s*shadow-xs'\n\s*: 'bg-white\s*border-slate-200\s*text-slate-700\s*hover:border-slate-300'\n\s*\}`\}/g,
  'className={`p-2 rounded-xl text-xs font-bold text-left border transition-all truncate cursor-pointer ${isSelected ? \'ring-2 ring-purple-500 border-purple-500 bg-purple-50 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100 shadow-xs\' : \'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600\'}`}'
);
content = content.replace(
  /<div className="p-3 bg-amber-50 \/40 border border-amber-200\s*rounded-xl space-y-1 animate-fadeIn">/g,
  '<div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1 animate-fadeIn">'
);
content = content.replace(
  /<label className="text-xs font-bold text-amber-900\s*">/g,
  '<label className="text-xs font-bold text-amber-900 dark:text-amber-200">'
);
content = content.replace(
  /className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-amber-300\s*bg-white\s*text-amber-900\s*outline-none focus:border-amber-500 shadow-xs"/g,
  'className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-100 outline-none focus:border-amber-500 shadow-xs"'
);

// 3. Select Flight & Personnel
content = content.replace(
  /className=\{`px-3 py-1\.5 rounded-lg text-\[11px\] font-bold transition-all cursor-pointer truncate \$\{\n\s*disposalFlight === f\n\s*\? 'bg-purple-600 text-white shadow-md'\n\s*: 'bg-slate-100\s*text-slate-600\s*hover:bg-slate-200\s*border border-slate-200\s*'\n\s*\}`\}/g,
  'className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer truncate ${disposalFlight === f ? \'bg-purple-600 text-white shadow-md\' : \'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700\'}`}'
);
content = content.replace(
  /<span className="text-slate-600\s*font-medium">/g,
  '<span className="text-slate-600 dark:text-slate-400 font-medium">'
);
content = content.replace(
  /Available: <strong className="text-emerald-700\s*font-bold">\{availableOnParade.length\}<\/strong> \/ \{flightAirmen.length\} in \{disposalFlight\}/g,
  'Available: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{availableOnParade.length}</strong> / {flightAirmen.length} in {disposalFlight}'
);
content = content.replace(
  /<span className="ml-2 font-bold text-purple-600\s*">/g,
  '<span className="ml-2 font-bold text-purple-600 dark:text-purple-400">'
);
content = content.replace(
  /className="text-purple-600\s*hover:text-purple-800\s*transition-colors cursor-pointer"/g,
  'className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors cursor-pointer"'
);
content = content.replace(
  /className="text-slate-400 hover:text-slate-600\s*transition-colors cursor-pointer"/g,
  'className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"'
);

// Airmen rows
content = content.replace(
  /className=\{`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer select-none text-xs \$\{\n\s*isChecked\n\s*\? 'bg-purple-50 \/40 border-purple-400 text-purple-950\s*font-bold shadow-xs'\n\s*: 'bg-white\s*border-slate-200\s*hover:border-purple-300 text-slate-800\s*font-medium'\n\s*\}`\}/g,
  'className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer select-none text-xs ${isChecked ? \'bg-purple-50 dark:bg-purple-900/40 border-purple-400 text-purple-950 dark:text-purple-100 font-bold shadow-xs\' : \'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 text-slate-800 dark:text-slate-200 font-medium\'}`}'
);
content = content.replace(
  /className="text-slate-400 font-normal ml-1"/g,
  'className="text-slate-400 dark:text-slate-500 font-normal ml-1"'
);
content = content.replace(
  /className="flex items-center justify-between p-2 rounded-lg border border-slate-200\/80\s*bg-slate-100\/80 \/60 text-xs select-none"/g,
  'className="flex items-center justify-between p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/80 dark:bg-slate-800/60 text-xs select-none"'
);
content = content.replace(
  /<span className="truncate text-slate-700\s*">/g,
  '<span className="truncate text-slate-700 dark:text-slate-300">'
);
content = content.replace(
  /className="px-2 py-0.5 bg-slate-200\s*text-slate-600\s*rounded-md text-\[10px\] font-bold"/g,
  'className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold"'
);
content = content.replace(
  /className="flex items-center space-x-1 px-2 py-0.5 bg-slate-200\s*hover:bg-slate-300\s*text-slate-700\s*rounded-md text-\[10px\] font-bold transition-colors cursor-pointer"/g,
  'className="flex items-center space-x-1 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-bold transition-colors cursor-pointer"'
);

// Footer
content = content.replace(
  /<div className="flex items-center justify-between pt-4 border-t border-slate-200\s*">/g,
  '<div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">'
);
content = content.replace(
  /<span className="text-xs text-slate-500\s*font-medium">/g,
  '<span className="text-xs text-slate-500 dark:text-slate-400 font-medium">'
);
content = content.replace(
  /className="px-5 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700\s*hover:bg-slate-100\s*transition-colors cursor-pointer"/g,
  'className="px-5 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"'
);

fs.writeFileSync('src/components/NightCountStateView.tsx', content, 'utf-8');
console.log('Fixed Add Disposal Modal styling');
