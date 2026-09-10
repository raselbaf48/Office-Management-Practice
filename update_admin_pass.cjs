const fs = require('fs');
const file = 'src/components/AdminPasscodeModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode1 = `const actualRole = isDefaultOwner ? 'SUPER_ADMIN' : (user?.role || assignedRole);`;
const replaceCode1 = `const actualRole = isDefaultOwner ? 'OWNER' : (user?.role || assignedRole);`;
content = content.replace(findCode1, replaceCode1);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched AdminPasscodeModal owner role!");
