const fs = require('fs');
const file = 'src/components/PrintableDutyRatioModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Change the header wrapper to be responsive
// From: className="flex-none bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between shadow-2xl print:hidden z-10 sticky top-0"
// To: className="flex-none bg-slate-900 border-b border-slate-700 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl print:hidden z-10 sticky top-0"
content = content.replace(
  'className="flex-none bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between shadow-2xl print:hidden z-10 sticky top-0"',
  'className="flex-none bg-slate-900 border-b border-slate-700 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl print:hidden z-10 sticky top-0"'
);

// Check if there are other similar headers
// Like PrintableParadeStateModal.tsx
fs.writeFileSync(file, content, 'utf8');
console.log('Patched PrintableDutyRatioModal header for mobile');
