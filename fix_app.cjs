const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<TopHeader([\s\S]*?)onLogoutUser=\{handleUserLogout\}/,
  `<TopHeader$1onLogoutUser={handleUserLogout}\n          onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}\n          onLogoutAdmin={() => handleRoleChange('USER')}`
);

fs.writeFileSync('src/App.tsx', code);
