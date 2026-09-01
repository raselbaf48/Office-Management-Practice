const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

code = code.replace(
  'const adminOrderList: { airman: Airman; note?: string }[] = [];',
  '// removed adminOrderList\n  // drillCatCList is defined earlier'
);

code = code.replace(
  '} else if ([\'ADMIN_ORDER\', \'CAT_C\', \'DRILL\'].includes(codeUpper) || notesLower.includes(\'drill\')) {\n        adminOrderList.push({ airman, note: "A',
  '} else if ([\'ADMIN_ORDER\', \'CAT_C\', \'DRILL\'].includes(codeUpper) || notesLower.includes(\'drill\')) {\n        drillCatCList.push({ airman, note: "A'
);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
