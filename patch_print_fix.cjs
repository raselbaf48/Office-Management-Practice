const fs = require('fs');

let modalContent = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

const oldStyle = `          <style>{\`
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

const newStyle = `          <style>{\`
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
              
              #root > div:not(.print-wrapper) {
                display: none !important;
              }
              
              /* Ensure the content spans pages correctly */
              #print-duty-ratio-content {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
            }
          \`}</style>`;

modalContent = modalContent.replace(oldStyle, newStyle);
modalContent = modalContent.replace(
  'className="fixed inset-0 z-[100] flex flex-col bg-slate-100 print:bg-white animate-fadeIn overflow-hidden print:block text-black"',
  'className="fixed inset-0 z-[100] flex flex-col bg-slate-100 print:bg-white animate-fadeIn overflow-hidden print:static print:block text-black print-wrapper"'
);

modalContent = modalContent.replace(
  'className="flex-1 overflow-auto print:overflow-visible flex justify-start sm:justify-center print:block"',
  'className="flex-1 overflow-y-auto overflow-x-hidden print:overflow-visible flex justify-start sm:justify-center print:block"'
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', modalContent, 'utf8');
console.log('Fixed modal classes');
