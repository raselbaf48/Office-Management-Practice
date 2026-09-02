import fs from 'fs';
let code = fs.readFileSync('src/components/FlightDutyRatioModal.tsx', 'utf8');

code = code.replace(
  /<div className="h-full flex flex-col w-full animate-fadeIn">/,
  '<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">'
);

code = code.replace(
  /className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full flex flex-col relative overflow-hidden h-full"/,
  'className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-6xl max-h-[90vh] shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden relative"'
);

code = code.replace(
  /\{\/\* Close hidden in inline mode \*\/}/,
  '<button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-rose-500 transition-colors"><X className="w-5 h-5" /></button>'
);

fs.writeFileSync('src/components/FlightDutyRatioModal.tsx', code);
