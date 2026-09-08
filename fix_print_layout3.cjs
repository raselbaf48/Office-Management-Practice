const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

// Remove the hardcoded inline styles for avoid from the wrappers
content = content.replace(
  '<div className="print:break-inside-avoid" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\', breakBefore: \'auto\' }}>',
  '<div className="print:mt-6 overflow-x-auto">'
);

content = content.replace(
  '<div className="print:break-inside-avoid print:mt-10" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\', breakBefore: \'auto\' }}>',
  '<div className="print:mt-8 overflow-x-auto">'
);

// also remove the style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }} from tables as the global css handles it
content = content.replace(
  /<table className="no-zebra border-collapse border border-black text-center text-\[12px\] bg-white text-black" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>/g,
  '<table className="no-zebra border-collapse border border-black text-center text-[12px] bg-white text-black w-full print:min-w-0">'
);

content = content.replace(
  /<table className="no-zebra border-collapse border border-black text-center text-\[12px\] w-full bg-white text-black" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>/g,
  '<table className="no-zebra border-collapse border border-black text-center text-[12px] bg-white text-black w-full print:min-w-0">'
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content, 'utf8');
