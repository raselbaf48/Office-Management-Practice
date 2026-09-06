const { PDFParse } = require('pdf-parse');
const fs = require('fs');
async function test() {
  const parser = new PDFParse();
  console.log(typeof parser.load);
  console.log(typeof parser.getText);
}
test();
