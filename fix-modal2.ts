import fs from 'fs';
let code = fs.readFileSync('src/components/FlightDutyRatioModal.tsx', 'utf8');

code = code.replace(
  /<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950\/70 backdrop-blur-xs animate-fadeIn">/g,
  '<div className="h-full flex flex-col w-full animate-fadeIn">'
);

code = code.replace(
  /className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-5xl w-full max-h-\[90vh\] flex flex-col relative overflow-hidden"/g,
  'className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full flex flex-col relative overflow-hidden h-full"'
);

code = code.replace(
  /<button onClick=\{onClose\} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-rose-500 transition-colors">\s*<X className="w-6 h-6" \/>\s*<\/button>/g,
  '{/* Close hidden in inline mode */}'
);

fs.writeFileSync('src/components/FlightDutyRatioModal.tsx', code);
