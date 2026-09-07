const fs = require('fs');

let modalContent = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

const styleBlock = `
        <div id="print-duty-ratio-content" className="w-max sm:w-full max-w-none sm:max-w-[1200px] mx-auto py-4 sm:py-8 px-2 sm:px-8 print:p-0 print:m-0 print:w-full print:max-w-none text-black bg-white">
          <style>{\`
            @media print {
              @page { size: A4 portrait; margin: 8mm; }
              body { background: white !important; }
              #root > div:not(#print-duty-ratio-content) { display: none !important; }
              /* Force the modal to be the top level relative to body */
              #print-duty-ratio-content {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                background: white;
                color: black;
              }
            }
          \`}</style>
`;

modalContent = modalContent.replace(
  '<div id="print-duty-ratio-content" className="w-max sm:w-full max-w-none sm:max-w-[1200px] mx-auto py-4 sm:py-8 px-2 sm:px-8 print:p-0 print:m-0 print:w-full print:max-w-none text-black bg-white">',
  styleBlock
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', modalContent, 'utf8');
console.log('Added print style block');
