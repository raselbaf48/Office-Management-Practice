const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

content = content.replace(
  '<div className="print:break-after-page pb-8 pt-4">',
  '<div className="print:break-after-page pb-8 pt-4 print:pb-0 print:pt-0">'
);

content = content.replace(
  '<div className="flex flex-col gap-10 print:gap-6">',
  '<div className="flex flex-col gap-10 print:gap-4">'
);

content = content.replace(
  /<div className="print:mt-4 print:block print:overflow-visible"/g,
  '<div className="print:mt-2 print:block print:overflow-visible"'
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content, 'utf8');
