const fs = require('fs');

let file = 'src/utils/authSession.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /role: isPrimary \? 'SUPER_ADMIN' : 'USER',/g,
  `role: isPrimary ? 'OWNER' : 'USER',`
);

fs.writeFileSync(file, code);
console.log('Fixed isPrimary role generation');
