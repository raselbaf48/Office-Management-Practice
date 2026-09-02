const fs = require('fs');
let code = fs.readFileSync('src/components/AssignDutyModal.tsx', 'utf8');
code = code.replace(
  /const isPastDate = fromDate < new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\];\n  const isSuperAdmin = session\?\.assignedRole === 'SUPER_ADMIN';\n  const isReadOnly = isPastDate && !isSuperAdmin;/,
  "const isPastDate = fromDate < new Date().toISOString().split('T')[0];\n  const isReadOnly = isPastDate && !isSuperAdmin;"
);
fs.writeFileSync('src/components/AssignDutyModal.tsx', code);
