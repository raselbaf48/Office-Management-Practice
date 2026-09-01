const fs = require('fs');
let content = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf-8');

// For Flying Wing branch
content = content.replace(
  /<div id="official-parade-document" className="bg-white text-black border border-slate-300 rounded-2xl shadow-lg p-6 overflow-x-auto">/g,
  '<div id="official-parade-document" className={`bg-white text-black border border-slate-300 rounded-2xl shadow-lg p-6 overflow-x-auto ${(isFlgWgPrintOpen || isInternalPrintOpen) ? \'print:hidden\' : \'\'}`}>'
);

// For 155 UASU BAF branch
content = content.replace(
  /<div\s*id="official-parade-document"\s*className="bg-white text-black border border-slate-300\s*rounded-2xl shadow-lg p-6 overflow-x-auto"\s*>/g,
  '<div id="official-parade-document" className={`bg-white text-black border border-slate-300 rounded-2xl shadow-lg p-6 overflow-x-auto ${(isFlgWgPrintOpen || isInternalPrintOpen) ? \'print:hidden\' : \'\'}`}>'
);

fs.writeFileSync('src/components/NightCountStateView.tsx', content, 'utf-8');
console.log('Added print:hidden to main documents');
