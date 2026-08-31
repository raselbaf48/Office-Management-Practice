const fs = require('fs');
let file = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');
file = file.replace(/Flight\s*<\/th>/, 'Date\n                        </th>');
fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', file, 'utf-8');
