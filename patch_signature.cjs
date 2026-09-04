const fs = require('fs');

let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf-8');

// Align signatures left instead of center
content = content.replace(
  /<div className="text-center font-bold min-w-\[210px\]">/g,
  '<div className="text-left font-bold min-w-[210px]">'
);

// Align the italic text to the left as well
content = content.replace(
  /<div className="mb-1 text-center font-serif italic text-xs text-slate-900 dark:text-white print:text-black select-none">/g,
  '<div className="mb-1 text-left font-serif italic text-xs text-slate-900 dark:text-white print:text-black select-none">'
);

// We should also remove the border-t on signatures as standard BAF formats usually don't have top borders for signatures
// or we can leave it if the user just wanted center->left
// Leaving it for now

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
console.log("Patched signature alignment");
