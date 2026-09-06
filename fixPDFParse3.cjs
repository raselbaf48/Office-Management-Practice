const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldInvoc = "const pdfData = typeof pdfParsePkg === 'function' ? await pdfParsePkg(buffer) : await (pdfParsePkg as any).default(buffer);";
const newInvoc = "const pdfData = typeof pdfParsePkg === 'function' ? await pdfParsePkg(buffer) : await (pdfParsePkg as any).default ? await (pdfParsePkg as any).default(buffer) : await (pdfParsePkg as any)(buffer);";

if (code.includes(oldInvoc)) {
    code = code.replace(oldInvoc, newInvoc);
    fs.writeFileSync('server.ts', code);
    console.log("Fixed invocation again");
} else {
    console.log("Could not find new invocation", oldInvoc);
}
