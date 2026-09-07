const fs = require('fs');

let content = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');
content = content.replace(
  '<div className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">',
  '<div className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden print:overflow-visible">'
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', content, 'utf8');

let modalContent = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');
modalContent = modalContent.replace(
  'className="fixed inset-0 z-[100] flex flex-col bg-slate-100 print:bg-white animate-fadeIn print:static print:block print:h-auto print:overflow-visible overflow-y-auto text-black"',
  'className="fixed inset-0 z-[100] flex flex-col bg-slate-100 print:bg-white animate-fadeIn print:absolute print:inset-0 print:block print:h-auto print:overflow-visible overflow-y-auto text-black"'
);
fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', modalContent, 'utf8');

console.log('Patched print styles');
