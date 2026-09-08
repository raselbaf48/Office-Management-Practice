const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

// Replace overflow-x-auto with overflow-x-auto print:overflow-visible
content = content.replace(
  /<div className="print:mt-6 overflow-x-auto">/g,
  '<div className="print:mt-6 overflow-x-auto print:overflow-visible print:break-inside-avoid">'
);

content = content.replace(
  /<div className="print:mt-8 overflow-x-auto">/g,
  '<div className="print:mt-8 overflow-x-auto print:overflow-visible print:break-inside-avoid">'
);

content = content.replace(
  /<div key=\{\`\$\{table\.id\}-\$\{chunkIdx\}\`\} className="mb-12 print:break-after-page overflow-x-auto">/g,
  '<div key={`${table.id}-${chunkIdx}`} className="mb-12 print:break-after-page overflow-x-auto print:overflow-visible">'
);

// To ensure Chrome respects page-break-inside avoid, it's good to apply it on the table directly, but print:break-inside-avoid on the div might be enough.
// Actually, let's make sure table rows can break if needed, but the formula table is short so we want to keep it together.

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content, 'utf8');
