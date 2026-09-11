const fs = require('fs');

const file = 'src/components/PrintableParadeStateModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove role check for settings icon
content = content.replace(/&&\s*sessionStorage\.getItem\('baf_user_role'\) === 'SUPER_ADMIN'\s*/g, '');

fs.writeFileSync(file, content);
console.log(`Patched ${file}`);
