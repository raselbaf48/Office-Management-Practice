const fs = require('fs');

let modalContent = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

const oldStyle = `              #root > div:not(.print-wrapper) {
                display: none !important;
              }`;

modalContent = modalContent.replace(oldStyle, '');

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', modalContent, 'utf8');
console.log('Removed faulty hide rule');
