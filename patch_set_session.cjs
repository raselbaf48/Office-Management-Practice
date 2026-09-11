const fs = require('fs');
const file = 'src/utils/authSession.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "assignedRole: assignedRole,",
  "assignedRole: assignedRole,\n    systemRole: detailedUser?.role || (cleanBd === '48456' ? 'OWNER' : 'USER'),"
);
fs.writeFileSync(file, content);
