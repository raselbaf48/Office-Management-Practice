const pdf = require('pdf-parse');
const fs = require('fs');

async function test() {
  try {
    // Generate a minimal dummy PDF buffer just to test if the function signature works.
    const dummyPdf = Buffer.from('%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n149\n%EOF\n');
    
    let res;
    if (typeof pdf === 'function') {
      res = await pdf(dummyPdf);
    } else if (pdf.default && typeof pdf.default === 'function') {
      res = await pdf.default(dummyPdf);
    }
    console.log("Success with function call:", !!res);
  } catch(e) {
    console.error("Error with function call:", e.message);
  }
}
test();
