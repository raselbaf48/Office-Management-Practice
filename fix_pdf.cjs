const fs = require('fs');

let file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

const oldPdfFunc = `  async function extractAllPagesFromPdf(buffer: Buffer): Promise<{ totalPages: number; pages: Array<{ pageNumber: number; text: string }>; fullText: string }> {
    try {
      const parser = new PDFParseClass({ data: buffer });
      const parsed = await parser.getText({ cellSeparator: ' | ', lineEnforce: true });`;

const newPdfFunc = `  async function extractAllPagesFromPdf(buffer: Buffer): Promise<{ totalPages: number; pages: Array<{ pageNumber: number; text: string }>; fullText: string }> {
    try {
      // Direct call to pdf-parse function instead of instantiating a class
      const pdf = require('pdf-parse');
      const parsed = await pdf(buffer);
      const totalPages = parsed.numpages || 1;
      const pages = [];
      
      // Fallback array since default pdf-parse doesn't split by page nicely in its standard return
      pages.push({
          pageNumber: 1,
          text: parsed.text || ''
      });`;

if (code.includes(`const parser = new PDFParseClass({ data: buffer });`)) {
  console.log("Replacing PDF extraction logic in server.ts");
  code = code.replace(/async function extractAllPagesFromPdf[\s\S]*?(?=\} catch \(err: any\))/g, newPdfFunc + `\n      const fullText = pages.map((p) => \`--- [PAGE \${p.pageNumber} OF \${totalPages}] ---\\n\${p.text}\`).join('\\n\\n');\n      return { totalPages, pages, fullText };\n    `);
  fs.writeFileSync(file, code);
  console.log("Replaced server.ts");
} else {
  console.log("Could not find block");
}
