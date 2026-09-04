const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

code = code.replace(
  "{matrix.map((table, tableIdx) => {",
  "{matrix.filter(t => !t.isDisabled).map((table, tableIdx) => {"
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
