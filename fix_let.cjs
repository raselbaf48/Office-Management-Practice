const fs = require('fs');
let code = fs.readFileSync('src/data/officialDutyRatioMatrix.ts', 'utf8');

code = code.replace(
  'const customDuties = getCustomDuties();\n        const existingMatrixIds = new Set(finalMatrix.map(t => t.id));',
  '// customDuties already declared\n        const existingMatrixIds = new Set(finalMatrix.map(t => t.id));'
);

fs.writeFileSync('src/data/officialDutyRatioMatrix.ts', code);
console.log('Fixed variable declaration');
