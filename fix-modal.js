const fs = require('fs');
let code = fs.readFileSync('src/components/FlightDutyRatioModal.tsx', 'utf8');

// Replace the modal wrapper
code = code.replace(
  /<div className="fixed inset-0 z-\[60\] [^>]+>/,
  '<div className="h-full flex flex-col w-full animate-fadeIn">'
);

// Remove the max-w-6xl max-h-[90vh] shadow-2xl from the inner wrapper
code = code.replace(
  /className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-6xl max-h-\[90vh\] shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden relative"/,
  'className="bg-white dark:bg-slate-900 rounded-3xl w-full flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden relative h-full"'
);

// Hide the close button in panel mode
code = code.replace(
  /<button\s+onClick=\{onClose\}\s+className="p-2[^>]+>\s*<X className="w-5 h-5"\s*\/>\s*<\/button>/g,
  '{/* Close button hidden in panel mode */}'
);

fs.writeFileSync('src/components/FlightDutyRatioModal.tsx', code);
