const fs = require('fs');

let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

code = code.replace(
  /const customKey = dutyCode \|\| 'OTHER DISPOSAL';/g,
  "const customKey = dutyCode === 'OTHERS' ? (notes || 'OTHER DISPOSAL') : (dutyCode || 'OTHER DISPOSAL');"
);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);

let code2 = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');
code2 = code2.replace(
  /let customKey = item.dutyName \|\| dutyCode \|\| 'OTHER DISPOSAL';/g,
  "let customKey = dutyCode === 'OTHERS' ? (item.notes || 'OTHER DISPOSAL') : (item.dutyName || dutyCode || 'OTHER DISPOSAL');"
);
fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code2);
