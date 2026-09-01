const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');
console.log('Header Det/ Tdy count:', (code.match(/Det\/ Tdy/g) || []).length);
console.log('stats.detTdyCount count:', (code.match(/stats\.detTdyCount/g) || []).length);
