const pdf = require('pdf-parse');
console.log(typeof pdf);
console.log(typeof pdf.default);
if (typeof pdf === 'function') {
  console.log('pdf is a function');
} else if (pdf.default && typeof pdf.default === 'function') {
  console.log('pdf.default is a function');
}
try {
  let f = pdf;
  console.log(f.toString().substring(0, 50));
} catch(e){}
