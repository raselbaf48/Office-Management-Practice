const fs = require('fs');

const file = 'src/components/PrintableParadeStateModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Patch 1: allCustomKeys loop
const search1 = `if (notes) {\n if (!['LEAVE', 'ATT', 'TDY', 'DETT', 'BAKE_N_BITE', 'RECEPTION', 'ESSN', 'CMH', 'BNS', 'BSH', 'SICK_REPORT', 'ED', 'ADMIN_ORDER', 'CLASS_TRG', 'GAMES', 'ABSENT', 'CANTEEN'].includes(codeUpper)) {\n customKey = notes;\n }\n }\n allCustomKeys.add(customKey);`;
const replace1 = `if (notes) {\n if (!['LEAVE', 'ATT', 'TDY', 'DETT', 'BAKE_N_BITE', 'RECEPTION', 'ESSN', 'CMH', 'BNS', 'BSH', 'SICK_REPORT', 'ED', 'ADMIN_ORDER', 'CLASS_TRG', 'GAMES', 'ABSENT', 'CANTEEN'].includes(codeUpper)) {\n customKey = notes;\n }\n }\n if (isPtDocument && codeUpper === 'CANTEEN') customKey = 'Reception Duty';\n if (isPtDocument && customKey === 'K/O & Reception') customKey = 'Reception Duty';\n allCustomKeys.add(customKey);`;

// Patch 2: dayCustomDisposals loop
const search2 = `if (notes) {\n if (!['LEAVE', 'ATT', 'TDY', 'DETT', 'BAKE_N_BITE', 'RECEPTION', 'ESSN', 'CMH', 'BNS', 'BSH', 'SICK_REPORT', 'ED', 'ADMIN_ORDER', 'CLASS_TRG', 'GAMES', 'ABSENT', 'CANTEEN'].includes(codeUpper)) {\n customKey = notes;\n }\n }\n if (!dayCustomDisposals[customKey]) dayCustomDisposals[customKey] = [];`;
const replace2 = `if (notes) {\n if (!['LEAVE', 'ATT', 'TDY', 'DETT', 'BAKE_N_BITE', 'RECEPTION', 'ESSN', 'CMH', 'BNS', 'BSH', 'SICK_REPORT', 'ED', 'ADMIN_ORDER', 'CLASS_TRG', 'GAMES', 'ABSENT', 'CANTEEN'].includes(codeUpper)) {\n customKey = notes;\n }\n }\n if (isPtDocument && codeUpper === 'CANTEEN') customKey = 'Reception Duty';\n if (isPtDocument && customKey === 'K/O & Reception') customKey = 'Reception Duty';\n if (!dayCustomDisposals[customKey]) dayCustomDisposals[customKey] = [];`;

if (content.includes(search1)) {
  content = content.replace(search1, replace1);
  console.log("Patched 1");
}

if (content.includes(search2)) {
  content = content.replace(search2, replace2);
  console.log("Patched 2");
}

fs.writeFileSync(file, content, 'utf8');

