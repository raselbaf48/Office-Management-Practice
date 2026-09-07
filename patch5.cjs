const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

code = code.replace(
  "u.role === 'OWNER' ? 'Owner' : role === 'SUPER_ADMIN' ? 'Super Admin' : u.role === 'ADMIN'",
  "u.role === 'OWNER' ? 'Owner' : u.role === 'SUPER_ADMIN' ? 'Super Admin' : u.role === 'ADMIN'"
);

code = code.replace(
  "log.role === 'OWNER' ? 'Owner' : role === 'SUPER_ADMIN' ? 'Super Admin' : log.role === 'ADMIN'",
  "log.role === 'OWNER' ? 'Owner' : log.role === 'SUPER_ADMIN' ? 'Super Admin' : log.role === 'ADMIN'"
);

fs.writeFileSync('src/components/SettingsModal.tsx', code);
