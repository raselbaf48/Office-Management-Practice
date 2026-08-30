const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

code = code.replace(/\\)\\s*:\\s*\\(\\n\\s*\\)}/g, ')}');
code = code.replace(/\\)\\s*:\\s*\\(\\)}/g, ')}');

fs.writeFileSync('src/components/Sidebar.tsx', code);
