const fs = require('fs');
let file = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf-8');

file = file.replace(/\/\/ Force Avionics if PT State and Overall is selected[\s\S]*?\}, \[isPtDocument, selectedFlight\]\);/, '');

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', file, 'utf-8');
console.log('PT State forced Avionics removed');
