const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf-8');

content = content.replace(
  /<div className="text-center font-bold min-w-\[210px\]">/g,
  '<div className="text-left font-bold min-w-[210px]">'
);

content = content.replace(
  /<div className="mb-1 text-center font-serif italic text-xs text-slate-900 dark:text-white select-none">/g,
  '<div className="mb-1 text-left font-serif italic text-xs text-slate-900 dark:text-white select-none">'
);

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', content);
