const fs = require('fs');
const file = 'src/components/PrintableDutyRatioModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace text-left with text-center in the print modal too.
content = content.replace(/text-left/g, 'text-center');

fs.writeFileSync(file, content, 'utf8');
console.log('Patched alignment in PrintableDutyRatioModal');
