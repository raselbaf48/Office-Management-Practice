const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

// I will write a regex to replace everything between "Total\nstr" (or totalStr column) and customDisposalsMap.
// Let's replace the block entirely.

const startIndex = code.indexOf('<th className="border border-black p-0 align-bottom text-center align-middle">'); 
// wait, the first one might be "Det/ Tdy"
