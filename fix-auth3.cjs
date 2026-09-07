const fs = require('fs');
let content = fs.readFileSync('src/utils/authSession.ts', 'utf8');

content = content.replace("role: 'OWNER',\\n      password: '48456',", "role: 'OWNER',\n      password: '48456',");

fs.writeFileSync('src/utils/authSession.ts', content);
