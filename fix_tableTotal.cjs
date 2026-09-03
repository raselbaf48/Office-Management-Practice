const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

code = code.replace(
  '        {matrix.map((table, tableIdx) => {\n          // Keep specific styling for first tables',
  '        {matrix.map((table, tableIdx) => {\n          const tableTotal = flights.reduce((sum, fl) => sum + table.data[fl].reduce((a,b) => a+b, 0), 0);\n          // Keep specific styling for first tables'
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
