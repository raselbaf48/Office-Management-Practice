const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

content = content.replace(
  /<div key=\{\`\$\{table\.id\}-\$\{chunkIdx\}\`\} className="mb-12 print:break-inside-avoid print:break-after-page" style=\{\{ pageBreakInside: 'avoid', breakInside: 'avoid' \}\}>/g,
  '<div key={`${table.id}-${chunkIdx}`} className="mb-12 print:break-after-page overflow-x-auto">'
);

content = content.replace(
  /<table className="no-zebra w-full border-collapse border border-black text-center text-\[11px\]" style=\{\{ pageBreakInside: 'avoid', breakInside: 'avoid' \}\}>/g,
  '<table className="no-zebra w-full border-collapse border border-black text-center text-[11px] print:min-w-0">'
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content, 'utf8');
