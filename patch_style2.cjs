const fs = require('fs');

let modalContent = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

const oldBlock = `          <style>{\`
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
          \`}</style>`;

const newBlock = `          <style>{\`
            @media print {
              @page { size: A4 landscape; margin: 8mm; }
              body { 
                background: white !important; 
                color: black !important;
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
              }
              /* Hide scrollbars during print */
              ::-webkit-scrollbar { display: none; }
              
              /* Ensure the content spans pages correctly */
              #print-duty-ratio-content {
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
            }
          \`}</style>`;

modalContent = modalContent.replace(oldBlock, newBlock);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', modalContent, 'utf8');
console.log('Fixed style block');
