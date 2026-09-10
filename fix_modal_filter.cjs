const fs = require('fs');
const file = 'src/components/DashboardParadeState.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetFind = `                    if (cat === 'TOTAL') return true;
                    if (cat === 'PARADE') return p.statusCategory === 'PARADE';
                    if (cat === 'DUTY') return p.statusCategory === 'DUTY';
                    if (cat === 'DUTY_OFF') return p.statusCategory === 'OFF' || p.dutyCode === 'DUTY_OFF';
                    if (cat === 'LEAVE') return p.statusCategory === 'LEAVE';
                    if (cat === 'TDY') return p.statusCategory === 'TDY';
                    if (cat === 'BAKE_N_BITE') return p.dutyCode === 'BAKE_N_BITE';
                    return true;`;

const targetReplace = `                    if (cat === 'TOTAL') return true;
                    if (cat === 'PARADE') return p.statusCategory === 'PARADE';
                    if (cat === 'DUTY') return p.statusCategory === 'DUTY';
                    if (cat === 'DUTY_OFF') return p.statusCategory === 'OFF' || p.dutyCode === 'DUTY_OFF';
                    if (cat === 'LEAVE') return p.statusCategory === 'LEAVE';
                    if (cat === 'TDY') return p.statusCategory === 'TDY';
                    if (cat === 'BAKE_N_BITE') return p.dutyCode === 'BAKE_N_BITE';
                    // For dynamically generated disposal categories
                    return p.statusCategory === cat || p.dutyCode === cat;`;

content = content.replace(targetFind, targetReplace);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched modal filter successfully");
