const fs = require('fs');

let modalContent = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

const oldStyle = `              /* Ensure the content spans pages correctly */
              #print-duty-ratio-content {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }`;

const newStyle = `              
              body * {
                visibility: hidden;
              }
              
              .print-wrapper, .print-wrapper * {
                visibility: visible;
              }
              
              .print-wrapper {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }

              /* Ensure the content spans pages correctly */
              #print-duty-ratio-content {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }`;

modalContent = modalContent.replace(oldStyle, newStyle);
fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', modalContent, 'utf8');
console.log('Added visibility hidden rule');
