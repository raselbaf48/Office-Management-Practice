const fs = require('fs');

const files = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/ParadeStateFormattedView.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Multi-day header keys
  content = content.replace(
    /if \(!\['LEAVE', 'ATT', 'TDY', 'DETT', 'BAKE_N_BITE', 'RECEPTION', 'ESSN', 'CMH', 'BNS', 'BSH', 'SICK_REPORT', 'ED', 'ADMIN_ORDER', 'CLASS_TRG', 'GAMES', 'ABSENT'\]\.includes\(codeUpper\)\)/g,
    "if (!['LEAVE', 'ATT', 'TDY', 'DETT', 'BAKE_N_BITE', 'RECEPTION', 'ESSN', 'CMH', 'BNS', 'BSH', 'SICK_REPORT', 'ED', 'ADMIN_ORDER', 'CLASS_TRG', 'GAMES', 'ABSENT', 'CANTEEN'].includes(codeUpper))"
  );
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log("Patched multi-day canteen custom keys");
