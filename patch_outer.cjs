const fs = require('fs');

let modalContent = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

modalContent = modalContent.replace(
  'className="fixed inset-0 z-[100] flex flex-col bg-slate-100 print:bg-white animate-fadeIn print:absolute print:inset-0 print:block print:h-auto print:overflow-visible overflow-y-auto text-black"',
  'className="fixed inset-0 z-[100] flex flex-col bg-slate-100 print:bg-white animate-fadeIn overflow-hidden print:block text-black"'
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', modalContent, 'utf8');
console.log('Fixed outer container classes');
