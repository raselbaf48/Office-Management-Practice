const fs = require('fs');
const file = 'src/components/DashboardParadeState.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetFind = `                          if (cat === 'TOTAL') return true;
                          if (cat === 'PARADE') return p.dutyCode === 'ON_PARADE' || ((p.dutyCode === 'IDAC' || p.dutyCode === 'IDA') && p.idaShift === 'Night');
                          if (cat === 'DUTY') return ['GD', 'BTF', 'NTF', 'HALISHAHAR', 'AIRPORT'].includes(p.dutyCode) || ((p.dutyCode === 'IDAC' || p.dutyCode === 'IDA') && p.idaShift !== 'Night');
                          if (cat === 'DUTY_OFF') return p.dutyCode === 'DUTY_OFF';
                          if (cat === 'LEAVE') return p.statusCategory === 'LEAVE';
                          if (cat === 'TDY') return p.statusCategory === 'TDY';
                          if (cat === 'BAKE_N_BITE') return p.dutyCode === 'BAKE_N_BITE';
                          return true;`;

const targetReplace = `                          if (cat === 'TOTAL') return true;
                          if (cat === 'PARADE') return p.dutyCode === 'ON_PARADE' || ((p.dutyCode === 'IDAC' || p.dutyCode === 'IDA') && p.idaShift === 'Night');
                          if (cat === 'DUTY') return ['GD', 'BTF', 'NTF', 'HALISHAHAR', 'AIRPORT'].includes(p.dutyCode) || ((p.dutyCode === 'IDAC' || p.dutyCode === 'IDA') && p.idaShift !== 'Night');
                          if (cat === 'DUTY_OFF') return p.dutyCode === 'DUTY_OFF' || p.statusCategory === 'OFF';
                          if (cat === 'LEAVE') return p.statusCategory === 'LEAVE';
                          if (cat === 'TDY') return p.statusCategory === 'TDY';
                          if (cat === 'BAKE_N_BITE') return p.dutyCode === 'BAKE_N_BITE';
                          return p.statusCategory === cat || p.dutyCode === cat;`;

content = content.replace(targetFind, targetReplace);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched modal header count filter");
