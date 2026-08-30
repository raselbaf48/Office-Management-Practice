const fs = require('fs');

let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

const regex = /\{\/\* \-\-\- Custom Logo Upload \-\-\- \*\/\}[\s\S]*?<\/div>\s*<\/div>/;
code = code.replace(regex, '');

fs.writeFileSync('src/components/SettingsModal.tsx', code);
