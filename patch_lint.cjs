const fs = require('fs');
let code = fs.readFileSync('src/utils/authSession.ts', 'utf8');

code = code.replace(
  "if (cleanBd === '48456' && session.role !== 'OWNER') {",
  "if (cleanBd === '48456' && session.assignedRole !== 'OWNER') {"
);

code = code.replace(
  "session.role = 'OWNER';",
  "session.assignedRole = 'OWNER';"
);

fs.writeFileSync('src/utils/authSession.ts', code);
