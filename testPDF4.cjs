const pdfParse = require('pdf-parse');
console.log(typeof pdfParse);
const fs = require('fs');
// check if it's a function or if it has a default
if (typeof pdfParse === 'function') {
  console.log('pdfParse is a function');
} else if (pdfParse.default && typeof pdfParse.default === 'function') {
  console.log('pdfParse.default is a function');
} else if (pdfParse.PDFParse && typeof pdfParse.PDFParse === 'function') {
  console.log('pdfParse.PDFParse is a function');
} else {
  console.log('pdfParse is not a function');
}
