const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

// The print wrappers were:
// <div className="print:break-inside-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
// <div className="print:break-inside-avoid print:mt-10" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>

content = content.replace(
  '<div className="print:break-inside-avoid" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\' }}>',
  '<div className="print:break-inside-avoid" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\', breakBefore: \'auto\' }}>'
);

content = content.replace(
  '<div className="print:break-inside-avoid print:mt-10" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\' }}>',
  '<div className="print:break-inside-avoid print:mt-10" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\', breakBefore: \'auto\' }}>'
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content, 'utf8');
