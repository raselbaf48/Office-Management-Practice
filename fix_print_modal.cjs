const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

// Fix the modal overlay center -> start so long content is scrollable from top
code = code.replace(
  'className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:static print:p-0 print:m-0 print:bg-white print:overflow-visible printable-modal-overlay"',
  'className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 pt-10 sm:pt-10 overflow-y-auto print:static print:p-0 print:m-0 print:bg-white print:overflow-visible printable-modal-overlay"'
);

// Auto fit to window for the modal content container
code = code.replace(
  'className="space-y-6 bg-white w-full max-w-[1400px] print:w-auto mx-auto border border-slate-300 rounded-xl shadow-2xl print:border-none print:rounded-none print:shadow-none p-4"',
  'className="space-y-6 bg-white w-full max-w-none 2xl:w-[98%] print:w-auto mx-auto border border-slate-300 rounded-xl shadow-2xl print:border-none print:rounded-none print:shadow-none p-4"'
);

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
console.log('Fixed PrintableParadeStateModal');
