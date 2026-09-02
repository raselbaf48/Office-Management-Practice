const fs = require('fs');
let content = fs.readFileSync('src/components/BiometricPromptModal.tsx', 'utf8');

const oldErr = "if (err.name === 'NotAllowedError' || err.message.toLowerCase().includes('not allowed')) {";
const newErr = "if (err.name === 'NotAllowedError' || err.message.toLowerCase().includes('not allowed') || err.message.toLowerCase().includes('not enabled') || err.message.toLowerCase().includes('permissions policy')) {";

content = content.replace(oldErr, newErr);
fs.writeFileSync('src/components/BiometricPromptModal.tsx', content);
