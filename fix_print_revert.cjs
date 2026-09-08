const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

// Undo the inline-block we added before
content = content.replace(
  '<div className="print:break-inside-avoid" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\', display: \'inline-block\', width: \'100%\' }}>',
  '<div className="print:break-inside-avoid" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\' }}>'
);

content = content.replace(
  '<div className="print:break-inside-avoid print:mt-10" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\', display: \'inline-block\', width: \'100%\' }}>',
  '<div className="print:break-inside-avoid print:mt-10" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\' }}>'
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content, 'utf8');
