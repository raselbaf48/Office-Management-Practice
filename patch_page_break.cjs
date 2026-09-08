const fs = require('fs');

let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

content = content.replace(
  '<div className="print:break-inside-avoid">',
  '<div className="print:break-inside-avoid" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\' }}>'
);

content = content.replace(
  '<div className="print:break-inside-avoid print:mt-10">',
  '<div className="print:break-inside-avoid print:mt-10" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\' }}>'
);

// Also add it directly to the tables just in case
content = content.replaceAll(
  '<table className="no-zebra border-collapse border border-black text-center text-[12px] w-full bg-white text-black">',
  '<table className="no-zebra border-collapse border border-black text-center text-[12px] w-full bg-white text-black" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\' }}>'
);

// Also the top tables
content = content.replaceAll(
  '<table className="no-zebra border-collapse border border-black text-center text-[12px] bg-white text-black">',
  '<table className="no-zebra border-collapse border border-black text-center text-[12px] bg-white text-black" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\' }}>'
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content, 'utf8');
