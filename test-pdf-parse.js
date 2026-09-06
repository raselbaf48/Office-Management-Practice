const fs = require('fs');
const pdfParsePkg = require('pdf-parse');
async function run() {
  try {
    const buffer = fs.readFileSync('test-pdf.js'); // just a dummy
  } catch (e) { console.error(e); }
}
run();
