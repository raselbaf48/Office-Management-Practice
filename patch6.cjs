const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const roleHierarchy = { 'SUPER_ADMIN': 3, 'ADMIN': 2, 'USER': 1 };",
  "const roleHierarchy = { 'OWNER': 4, 'SUPER_ADMIN': 3, 'ADMIN': 2, 'USER': 1 };"
);

fs.writeFileSync('src/App.tsx', code);
