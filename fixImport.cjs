const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const importRegex = /import pdfParsePkg from 'pdf-parse';/g;
const newImport = `import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);\nconst pdfParsePkg = require('pdf-parse');`;

if (code.match(importRegex)) {
    code = code.replace(importRegex, newImport);
    fs.writeFileSync('server.ts', code);
    console.log("Fixed import");
} else {
    console.log("Could not find import");
}
