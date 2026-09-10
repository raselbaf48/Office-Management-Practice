const fs = require('fs');
const file = 'src/components/DashboardParadeState.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetFind = `                    if (cat === 'PARADE') return p.statusCategory === 'PARADE';`;
const targetReplace = `                    if (cat === 'PARADE') return p.dutyCode === 'ON_PARADE' || ((p.dutyCode === 'IDAC' || p.dutyCode === 'IDA') && p.idaShift === 'Night');`;

content = content.replace(targetFind, targetReplace);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched modal filter duty definition");
