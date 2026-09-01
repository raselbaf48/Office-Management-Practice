const fs = require('fs');
let code = fs.readFileSync('src/components/AttachmentRegisterView.tsx', 'utf-8');
code = code.replace(/setAttAirmanIds\(activeIds\);/g, "setAttAirmanId('');");
fs.writeFileSync('src/components/AttachmentRegisterView.tsx', code, 'utf-8');
console.log('Fixed activeIds setAttAirmanIds');
