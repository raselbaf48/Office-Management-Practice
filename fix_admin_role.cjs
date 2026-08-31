const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPasscodeModal.tsx', 'utf8');

code = code.replace(
  "const actualRole = user?.role || (isDefaultOwner ? 'SUPER_ADMIN' : assignedRole);",
  "const actualRole = isDefaultOwner ? 'SUPER_ADMIN' : (user?.role || assignedRole);"
);

fs.writeFileSync('src/components/AdminPasscodeModal.tsx', code);
