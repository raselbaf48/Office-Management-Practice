const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPasscodeModal.tsx', 'utf8');
content = content.replace(/\\`/g, '`');
fs.writeFileSync('src/components/AdminPasscodeModal.tsx', content);
