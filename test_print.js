const fs = require('fs');

let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

// For "DISTRIBUTION AS PER MANPOWER" and "DISTRIBUTION AS PER FLIGHT", change the wrapper's display to inline-block or table.
// Let's replace the wrapper styling:

content = content.replace(
  /<div className="print:break-inside-avoid"[^>]*>\s*<h4[^>]*>DISTRIBUTION AS PER MANPOWER/g,
  '<div className="print:break-inside-avoid w-full print:block" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\', display: \'table\' }}>\n                <h4 className="font-bold underline text-center mb-2">DISTRIBUTION AS PER MANPOWER'
);

content = content.replace(
  /<div className="print:break-inside-avoid print:mt-10"[^>]*>\s*<h4[^>]*>DISTRIBUTION AS PER FLIGHT/g,
  '<div className="print:break-inside-avoid print:mt-10 w-full print:block" style={{ pageBreakInside: \'avoid\', breakInside: \'avoid\', display: \'table\' }}>\n                <h4 className="font-bold underline text-center mb-2">DISTRIBUTION AS PER FLIGHT'
);

// We need to be careful with regex, let's use string replacement carefully.
