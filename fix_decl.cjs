const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

code = code.replace(
  'const drillCatCList: { airman: Airman; note?: string }[] = [];\n  const leaveList: { airman: Airman; note?: string }[] = [];\n  const drillCatCList: { airman: Airman; note?: string }[] = [];',
  'const leaveList: { airman: Airman; note?: string }[] = [];\n  const drillCatCList: { airman: Airman; note?: string }[] = [];'
);

// wait, the error shows:
// 890|    const drillCatCList: { airman: Airman; note?: string }[] = [];
// 891|    const leaveList: { airman: Airman; note?: string }[] = [];
// 892|    const drillCatCList: { airman: Airman; note?: string }[] = [];

code = code.replace(
  'const onPtList: { airman: Airman; note?: string }[] = [];\n  const drillCatCList: { airman: Airman; note?: string }[] = [];\n  const leaveList: { airman: Airman; note?: string }[] = [];\n  const drillCatCList: { airman: Airman; note?: string }[] = [];',
  'const onPtList: { airman: Airman; note?: string }[] = [];\n  const leaveList: { airman: Airman; note?: string }[] = [];\n  const drillCatCList: { airman: Airman; note?: string }[] = [];'
);
fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
