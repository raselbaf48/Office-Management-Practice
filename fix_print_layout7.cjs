const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

// The "All Duties Summary" section has:
// <div className="print:mt-6 overflow-x-auto print:overflow-visible print:break-inside-avoid">
content = content.replace(
  /<div className="print:mt-6 overflow-x-auto print:overflow-visible print:break-inside-avoid">/g,
  '<div className="print:mt-8 print:block print:overflow-visible">'
);

content = content.replace(
  /<div className="print:mt-8 overflow-x-auto print:overflow-visible print:break-inside-avoid">/g,
  '<div className="print:mt-8 print:block print:overflow-visible">'
);

// We need to restore page break properties specifically on the rows or the container.
// Actually, standard pageBreakInside: 'avoid' on the container level is best if done directly in style.
content = content.replace(
  /<div className="print:mt-8 print:block print:overflow-visible">/g,
  '<div className="print:mt-8 print:block print:overflow-visible" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>'
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content, 'utf8');
