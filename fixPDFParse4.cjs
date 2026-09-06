const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldInvoc = "const pdfData = typeof pdfParsePkg === 'function' ? await pdfParsePkg(buffer) : await (pdfParsePkg as any).default ? await (pdfParsePkg as any).default(buffer) : await (pdfParsePkg as any)(buffer);";
const newInvoc = "const pdfData = typeof pdfParsePkg === 'function' ? await pdfParsePkg(buffer) : (pdfParsePkg as any).PDFParse ? await (pdfParsePkg as any).PDFParse(buffer) : await (pdfParsePkg as any).default(buffer);";

if (code.includes(oldInvoc)) {
    code = code.replace(oldInvoc, newInvoc);
    fs.writeFileSync('server.ts', code);
    console.log("Fixed invocation to use PDFParse");
} else {
    console.log("Could not find invocation");
}
