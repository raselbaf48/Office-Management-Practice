const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const regex = /\\)\\s*:\\s*\\(\\s*\\)}/g;
code = code.replace(regex, ')}');

fs.writeFileSync('src/components/Sidebar.tsx', code);
