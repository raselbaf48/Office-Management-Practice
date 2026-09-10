const fs = require('fs');
const file = 'src/components/DashboardParadeState.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetFind = `              if (p.statusCategory === 'PARADE' || p.statusCategory === 'DUTY') return;`;
const targetReplace = `              // Canteen is not treated as duty here for dynamic rendering
              if (p.statusCategory === 'PARADE' || (p.statusCategory === 'DUTY' && !['CANTEEN', 'RECEPTION', 'GAMES'].includes(p.dutyCode))) return;`;

content = content.replace(targetFind, targetReplace);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched exclude for dynamic disposals");
