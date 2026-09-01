const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');
const lines = code.split('\n');
console.log(lines.slice(1640, 1820).join('\n'));
