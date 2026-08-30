const fs = require('fs');
let code = fs.readFileSync('src/components/IdacSettingsModal.tsx', 'utf8');

const regex = /\{\/\* Seniority & Instructions Info \*\/\}\s*<div className="p-3 bg-emerald-50\/60[\s\S]*?<\/div>\s*<\/div>/;
code = code.replace(regex, '');

fs.writeFileSync('src/components/IdacSettingsModal.tsx', code);
