const fs = require('fs');
const file = 'src/components/TopHeader.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `{role === 'OWNER' ? 'Owner Active' : (role === 'SUPER_ADMIN' || role === 'OWNER') ? 'Super Admin Active' : 'Admin Active'}`;
const replaceCode = `{role === 'OWNER' ? 'Owner Active' : role === 'SUPER_ADMIN' ? 'Super Admin Active' : 'Admin Active'}`;
content = content.replace(findCode, replaceCode);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched TopHeader role text!");
