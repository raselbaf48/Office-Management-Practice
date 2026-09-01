const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');
console.log(code.includes('ALL_DISPOSAL_OPTIONS'));
