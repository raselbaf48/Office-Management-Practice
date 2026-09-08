const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

// Ensure no remaining overflow issues
content = content.replace(/overflow-x-auto/g, 'overflow-x-auto print:overflow-visible');
// We might have duplicated print:overflow-visible now, clean it up
content = content.replace(/print:overflow-visible print:overflow-visible/g, 'print:overflow-visible');

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content, 'utf8');
