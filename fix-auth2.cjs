const fs = require('fs');
let content = fs.readFileSync('src/utils/authSession.ts', 'utf8');

content = content.replace(/role: 'SUPER_ADMIN',\s*password: '48456',/g, "role: 'OWNER',\\n      password: '48456',");

fs.writeFileSync('src/utils/authSession.ts', content);
