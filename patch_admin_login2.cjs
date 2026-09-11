const fs = require('fs');
const file = 'src/components/AdminPasscodeModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// I will just change all RandomizedKeypad maxLength={10} to maxLength={4}
content = content.replace(/maxLength=\{10\}/g, 'maxLength={4}');

fs.writeFileSync(file, content);
console.log("Patched maxLength AdminPasscodeModal.");
