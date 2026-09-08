const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

content = content.replace(
  '<div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/90 backdrop-blur-sm overflow-hidden print:bg-white print:block">',
  '<div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/90 backdrop-blur-sm overflow-hidden print:bg-white print:static print:h-auto print:w-auto print:overflow-visible print:block">'
);

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', content, 'utf8');
