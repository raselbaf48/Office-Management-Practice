const fs = require('fs');
const file = 'src/components/DashboardParadeState.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetFind = `              else if (p.statusCategory === 'RECEPTION' || p.dutyCode === 'RECEPTION') { title = 'K/O & Reception'; cat = 'RECEPTION'; color = 'amber'; IconComp = Coffee; subtitle = 'Duty'; }`;
const targetReplace = `              else if (p.statusCategory === 'RECEPTION' || p.dutyCode === 'RECEPTION') { title = p.dutyName || 'K/O & Reception'; cat = 'RECEPTION'; color = 'amber'; IconComp = Coffee; subtitle = 'Duty'; }`;

content = content.replace(targetFind, targetReplace);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched Dashboard Reception title");
