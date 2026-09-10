const fs = require('fs');
const file = 'src/components/DashboardParadeState.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetFind1 = `                          return p.statusCategory === cat || p.dutyCode === cat;`;
const targetReplace1 = `                          if (cat === 'CANTEEN') return p.statusCategory === 'CANTEEN' || p.dutyCode === 'CANTEEN';
                          if (cat === 'RECEPTION') return p.statusCategory === 'RECEPTION' || p.dutyCode === 'RECEPTION';
                          if (cat === 'GAMES') return p.statusCategory === 'GAMES' || p.dutyCode === 'GAMES';
                          return p.statusCategory === cat || p.dutyCode === cat;`;

const targetFind2 = `                    // For dynamically generated disposal categories
                    return p.statusCategory === cat || p.dutyCode === cat;`;
const targetReplace2 = `                    // For dynamically generated disposal categories
                    if (cat === 'CANTEEN') return p.statusCategory === 'CANTEEN' || p.dutyCode === 'CANTEEN';
                    if (cat === 'RECEPTION') return p.statusCategory === 'RECEPTION' || p.dutyCode === 'RECEPTION';
                    if (cat === 'GAMES') return p.statusCategory === 'GAMES' || p.dutyCode === 'GAMES';
                    return p.statusCategory === cat || p.dutyCode === cat;`;

content = content.replace(targetFind1, targetReplace1);
content = content.replace(targetFind2, targetReplace2);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched modal filter logic");
