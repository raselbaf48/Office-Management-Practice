const fs = require('fs');

let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

const regex = /\{\/\* 2\. LOGO \& BRANDING \*\/\}[\s\S]*?\{\/\* USER LOGIN ACCESS \& DETAILS \*\/\}/;
code = code.replace(regex, "{/* USER LOGIN ACCESS & DETAILS */}");

fs.writeFileSync('src/components/SettingsModal.tsx', code);
