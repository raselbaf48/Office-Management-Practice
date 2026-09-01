const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

// Add them back as empty lists or just initialize them to avoid TS errors
const toAdd = `
  const adminOrderList: { airman: Airman; note?: string }[] = [];
  const classTrgList: { airman: Airman; note?: string }[] = [];
`;

code = code.replace(
  'const leaveList: { airman: Airman; note?: string }[] = [];\n  const drillCatCList: { airman: Airman; note?: string }[] = [];',
  'const leaveList: { airman: Airman; note?: string }[] = [];\n  const drillCatCList: { airman: Airman; note?: string }[] = [];' + toAdd
);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
