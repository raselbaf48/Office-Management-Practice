const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const pdfData = typeof pdfParsePkg === 'function' \? await pdfParsePkg\(buffer\) : \(pdfParsePkg as any\).PDFParse \? await \(pdfParsePkg as any\)\.PDFParse\(buffer\) : await \(pdfParsePkg as any\).default\(buffer\);/;

const replacement = `
            let pdfData: any = {};
            if (typeof pdfParsePkg === 'function') {
              pdfData = await pdfParsePkg(buffer);
            } else if ((pdfParsePkg as any).PDFParse) {
              const parser = new (pdfParsePkg as any).PDFParse();
              await parser.load(buffer);
              const text = await parser.getText();
              pdfData = { text };
            } else if ((pdfParsePkg as any).default && typeof (pdfParsePkg as any).default === 'function') {
              pdfData = await (pdfParsePkg as any).default(buffer);
            }
`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Fixed PDF parse instantiation");
} else {
    console.log("Could not find the exact line");
}
