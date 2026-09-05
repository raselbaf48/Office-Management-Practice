const fs = require('fs');

let content = fs.readFileSync('src/components/UserLoginGate.tsx', 'utf8');

// Replace role assignment in standard login
content = content.replace(
  /setUserSession\(airman, validation\.detailedUser\?\.role \|\| 'USER', validation\.detailedUser\);/,
  `const assignedLoginRole = cleanInput === '48456' ? 'SUPER_ADMIN' : 'USER';
        setUserSession(airman, assignedLoginRole, validation.detailedUser);`
);

// We should also replace the hardcoded '474455' with '48456' in the password reset bypass if necessary?
// The prompt says "Just 48456 aita apatoto sudhu admin login bypass kore direct Super admin login hbe."
content = content.replace(
  /role: cleanBd === '474455' \? 'SUPER_ADMIN' : 'USER',/g,
  `role: cleanBd === '48456' ? 'SUPER_ADMIN' : 'USER',`
);

fs.writeFileSync('src/components/UserLoginGate.tsx', content);
console.log("Updated UserLoginGate.tsx");
