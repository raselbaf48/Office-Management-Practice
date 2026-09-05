const fs = require('fs');

function fixTypes() {
  let file = 'src/types.ts';
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(
    /export type UserRole = 'SUPER_ADMIN' \| 'ADMIN' \| 'USER';/,
    `export type UserRole = 'OWNER' | 'SUPER_ADMIN' | 'ADMIN' | 'USER';`
  );

  code = code.replace(
    /export type UserLoginRole = 'USER' \| 'ADMIN' \| 'SUPER_ADMIN';/,
    `export type UserLoginRole = 'OWNER' | 'SUPER_ADMIN' | 'ADMIN' | 'USER';`
  );

  fs.writeFileSync(file, code);
}
fixTypes();
console.log('Fixed types');
