const fs = require('fs');

let file = 'src/utils/authSession.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /role: 'SUPER_ADMIN',\s*password: '48456',\s*adminPass: '51519919',\s*ownerPass: '51519919',/g,
  `role: 'OWNER',
  password: '48456',
  adminPass: '51519919',
  ownerPass: '51519919',`
);

fs.writeFileSync(file, code);
console.log('Fixed owner role in constant');
