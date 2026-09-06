const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const importRegex = /import { createRequire } from 'module';\nconst require = createRequire\(import\.meta\.url\);\nconst pdfParsePkg = require\('pdf-parse'\);/g;
const newImport = `import * as pdfParsePkgRaw from 'pdf-parse';\nconst pdfParsePkg = (pdfParsePkgRaw as any).default || pdfParsePkgRaw;`;

if (code.match(importRegex)) {
    code = code.replace(importRegex, newImport);
    fs.writeFileSync('server.ts', code);
    console.log("Fixed import again");
} else {
    console.log("Could not find import");
}
