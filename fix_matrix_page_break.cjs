const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

// Remove print:break-after-page from the matrix tables
content = content.replace(
  /className="mb-12 print:break-after-page overflow-x-auto print:overflow-visible"/g,
  'className="mb-8 print:mb-4 overflow-x-auto print:overflow-visible" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}'
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content, 'utf8');
