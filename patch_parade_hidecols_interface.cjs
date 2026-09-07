const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

code = code.replace(/initialToDate\?:\s*string;/, "initialToDate?: string;\n  initialHideEmptyColumns?: boolean;");

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
