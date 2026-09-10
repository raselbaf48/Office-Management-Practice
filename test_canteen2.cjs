const fs = require('fs');
const file = 'src/components/DashboardParadeState.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetFind = `if (cat === 'TOTAL') return true;`;
const targetReplace = `if (cat === 'TOTAL') return true;`;

content = content.replace(targetFind, targetReplace);
fs.writeFileSync(file, content, 'utf8');
console.log("No op check");
