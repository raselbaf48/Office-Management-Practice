const fs = require('fs');
const file = 'src/components/TopHeader.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `(userSession?.assignedRole === 'ADMIN' || userSession?.assignedRole === 'SUPER_ADMIN' || userSession?.assignedRole === 'OWNER') && (`;
const replacementStr = `(userSession?.systemRole === 'ADMIN' || userSession?.systemRole === 'SUPER_ADMIN' || userSession?.systemRole === 'OWNER') && (`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content);
  console.log("Patched TopHeader systemRole.");
} else {
  console.log("Could not find targetStr in TopHeader.");
}
