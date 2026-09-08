const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

// Restore flex layout for print so tables stay side-by-side
content = content.replace(
  '<div className="flex flex-col gap-10 print:block print:space-y-10">',
  '<div className="flex flex-col gap-10 print:gap-6">'
);

content = content.replace(
  '<div className="flex justify-center gap-12 print:block print:space-y-8">',
  '<div className="flex justify-center gap-12">'
);

// Reduce top margin of the other tables in print
content = content.replace(
  /<div className="print:mt-8 print:block print:overflow-visible"/g,
  '<div className="print:mt-4 print:block print:overflow-visible"'
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content, 'utf8');
