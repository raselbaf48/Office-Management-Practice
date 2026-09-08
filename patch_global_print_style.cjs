const fs = require('fs');

let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

const additionalPrintStyles = `
              /* Prevent page breaks inside tables and rows */
              table { page-break-inside: avoid !important; break-inside: avoid !important; }
              tr    { page-break-inside: avoid !important; break-inside: avoid !important; }
              thead { display: table-header-group !important; }
              tfoot { display: table-footer-group !important; }
              /* Force elements with these classes to avoid breaking */
              .print\\:break-inside-avoid {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
`;

content = content.replace(
  '/* Hide scrollbars during print */',
  additionalPrintStyles + '\n              /* Hide scrollbars during print */'
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content, 'utf8');
