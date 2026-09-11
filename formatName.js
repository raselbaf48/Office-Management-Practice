const fs = require('fs');
const content = fs.readFileSync('src/utils/docxExport.ts', 'utf8');
console.log("File size:", content.length);
