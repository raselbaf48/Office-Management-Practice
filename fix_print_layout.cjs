const fs = require('fs');

let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

// For DISTRIBUTION AS PER MANPOWER
content = content.replace(
  '<div className="print:break-inside-avoid" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\' }}>',
  '<div className="print:break-inside-avoid" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\', display: \'inline-block\', width: \'100%\' }}>'
);

// For DISTRIBUTION AS PER FLIGHT
content = content.replace(
  '<div className="print:break-inside-avoid print:mt-10" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\' }}>',
  '<div className="print:break-inside-avoid print:mt-10" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\', display: \'inline-block\', width: \'100%\' }}>'
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content, 'utf8');
