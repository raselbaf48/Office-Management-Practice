const fs = require('fs');
const file = 'src/components/DashboardParadeState.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetFind1 = `{data?.summary?.onDuty ?? data?.personnelStatusList?.filter((p) => p.statusCategory === 'DUTY').length ?? 0}`;
const targetReplace1 = `{data?.personnelStatusList?.filter(p => ['GD', 'BTF', 'NTF', 'HALISHAHAR', 'AIRPORT'].includes(p.dutyCode) || ((p.dutyCode === 'IDAC' || p.dutyCode === 'IDA') && p.idaShift !== 'Night')).length || data?.summary?.onDuty || 0}`;

const targetFind2 = `                    if (cat === 'DUTY') return p.statusCategory === 'DUTY';`;
const targetReplace2 = `                    if (cat === 'DUTY') return ['GD', 'BTF', 'NTF', 'HALISHAHAR', 'AIRPORT'].includes(p.dutyCode) || ((p.dutyCode === 'IDAC' || p.dutyCode === 'IDA') && p.idaShift !== 'Night');`;

content = content.replace(targetFind1, targetReplace1);
content = content.replace(targetFind2, targetReplace2);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched duty count and filter logic");
