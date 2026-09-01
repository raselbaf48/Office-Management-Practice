const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');
code = code.replace(/    <\/div>\n    <\/div>\n  \);\n};/, '  );\n};');
fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
