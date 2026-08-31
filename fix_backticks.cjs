const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/\\\`/g, '`');
  code = code.replace(/\\\$/g, '$');
  fs.writeFileSync(file, code);
}

fixFile('src/components/UserLoginDetailModal.tsx');
fixFile('src/components/UserLoginGate.tsx');
fixFile('src/components/AdminPasscodeModal.tsx');
console.log("Fixed!");
