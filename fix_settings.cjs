const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

code = code.replace(/role: UserRole;/, "role: UserRole;\n  userFlight?: string;");
code = code.replace(/role,\n  currentTheme,/, "role,\n  userFlight,\n  currentTheme,");

fs.writeFileSync('src/components/SettingsModal.tsx', code);
