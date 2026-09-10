const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPasscodeModal.tsx', 'utf8');

content = content.replace(/Passwords do not match/g, 'PINs do not match');
content = content.replace(/Password Reset/g, 'PIN Reset');

fs.writeFileSync('src/components/AdminPasscodeModal.tsx', content, 'utf8');
