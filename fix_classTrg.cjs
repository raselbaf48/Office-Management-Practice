const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

code = code.replace(
  '  const adminOrderList: { airman: Airman; note?: string }[] = [];\n  const classTrgList: { airman: Airman; note?: string }[] = [];',
  '  const adminOrderList: { airman: Airman; note?: string }[] = [];'
);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
