const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

// Change landscape to portrait in print styles
content = content.replace(
  /@page \{ size: A4 landscape; margin: 8mm; \}/g,
  '@page { size: A4 portrait; margin: 8mm; }'
);

// We need to adjust the width of the tables so they fit well in portrait format.
// Portrait A4 is narrower, so the 31-day tables will be very tight. We should use a smaller font or padding if needed, 
// but it seems the text-[11px] and p-1 might just fit, or we can make it text-[10px] for the matrix tables.
content = content.replace(
  /<table className="no-zebra w-full border-collapse border border-black text-center text-\[11px\] print:min-w-0">/g,
  '<table className="no-zebra w-full border-collapse border border-black text-center text-[11px] sm:text-[10px] print:text-[10px] print:min-w-0">'
);

// We should also remove the hard page break after the first page content completely if they want it to flow naturally 
// and fill the spaces. The user said "Protekta page e niche faka ache... pejer upore niche jeno faka na thake."
// This means they want the tables to pack as tightly as possible without forced breaks, except when a table naturally flows to the next page.

content = content.replace(
  /<div className="print:break-after-page pb-8 pt-4 print:pb-0 print:pt-0">/g,
  '<div className="pb-8 pt-4 print:pb-4 print:pt-0">'
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content, 'utf8');
