const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

// For the daily tables:
content = content.replace(
  '<div key={`${table.id}-${chunkIdx}`} className="mb-12 print:break-inside-avoid print:break-after-page">',
  '<div key={`${table.id}-${chunkIdx}`} className="mb-12 print:break-inside-avoid print:break-after-page" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\' }}>'
);

content = content.replaceAll(
  '<table className="no-zebra w-full border-collapse border border-black text-center text-[11px]">',
  '<table className="no-zebra w-full border-collapse border border-black text-center text-[11px]" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\' }}>'
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content, 'utf8');
