const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace "const pdfData = await PDFParseClass(buffer);" with:
// "const pdfData = typeof PDFParseClass === 'function' ? await PDFParseClass(buffer) : await pdfParsePkg(buffer);"

const oldStr = "const pdfData = await PDFParseClass(buffer);";
const newStr = "const pdfData = typeof PDFParseClass === 'function' ? await PDFParseClass(buffer) : await pdfParsePkg.default ? await pdfParsePkg.default(buffer) : await (pdfParsePkg as any)(buffer);";

if (code.includes(oldStr)) {
    code = code.replace(oldStr, newStr);
    fs.writeFileSync('server.ts', code);
    console.log("Fixed PDFParse invocation in server.ts");
} else {
    console.log("Could not find PDFParseClass invocation");
}
