const fs = require('fs');

let file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /if \(saved === 'SUPER_ADMIN'\) return 'SUPER_ADMIN';\s*return saved === 'ADMIN' \? 'ADMIN' : 'USER';/,
  `if (saved === 'OWNER') return 'OWNER';
    if (saved === 'SUPER_ADMIN') return 'SUPER_ADMIN';
    return saved === 'ADMIN' ? 'ADMIN' : 'USER';`
);

fs.writeFileSync(file, code);
console.log('Fixed App.tsx role parsing');
