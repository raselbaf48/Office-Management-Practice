const fs = require('fs');
const code = fs.readFileSync('src/utils/docxExport.ts', 'utf8');
console.log(code.match(/exportParadeStateDocx/g));
console.log(code.includes('exportParadeStateDocx'));
