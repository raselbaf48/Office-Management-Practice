const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The `pdfParsePkg` is a CommonJS module that exports a single function.
// Using `import * as pdfParsePkg from 'pdf-parse'` in ESM gets us an object 
// where the default export is the function. But since we use esbuild to bundle, 
// the shape can vary.

const replaceImports = `import pdfParsePkg from 'pdf-parse';`;

if (code.includes(`import * as pdfParsePkg from 'pdf-parse';`)) {
    code = code.replace(`import * as pdfParsePkg from 'pdf-parse';`, replaceImports);
    
    // Also remove the `const PDFParseClass...` line entirely since we will just use pdfParsePkg
    code = code.replace(`const PDFParseClass: any = (pdfParsePkg as any).PDFParse || (pdfParsePkg as any).default?.PDFParse || (pdfParsePkg as any).default || pdfParsePkg;`, ``);
    
    // And fix the invocation
    const invocation = `const pdfData = typeof PDFParseClass === 'function' ? await PDFParseClass(buffer) : await pdfParsePkg.default ? await pdfParsePkg.default(buffer) : await (pdfParsePkg as any)(buffer);`;
    const newInvocation = `const pdfData = typeof pdfParsePkg === 'function' ? await pdfParsePkg(buffer) : await (pdfParsePkg as any).default(buffer);`;
    code = code.replace(invocation, newInvocation);
    
    fs.writeFileSync('server.ts', code);
    console.log("Fixed PDF parse completely");
} else {
    console.log("Could not find import statement");
}

