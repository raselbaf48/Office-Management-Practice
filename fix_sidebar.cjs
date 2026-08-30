const fs = require('fs');

let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const regex = /\{\/\* Admin Switcher in Sidebar \*\/\}[\s\S]*?<\/div>\s*\)\}/;
code = code.replace(regex, '');

fs.writeFileSync('src/components/Sidebar.tsx', code);
