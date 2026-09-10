const fs = require('fs');
const file = 'src/components/DashboardParadeState.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetFind = `            Currently <strong className="text-amber-600 dark:text-amber-400">{data?.summary?.onDuty || 0}</strong> personnel are deployed on base guard duties, IDAC operations, and Halishahar shifts.`;
const targetReplace = `            Currently <strong className="text-amber-600 dark:text-amber-400">{data?.personnelStatusList?.filter(p => ['GD', 'BTF', 'NTF', 'HALISHAHAR', 'AIRPORT'].includes(p.dutyCode) || ((p.dutyCode === 'IDAC' || p.dutyCode === 'IDA') && p.idaShift !== 'Night')).length || data?.summary?.onDuty || 0}</strong> personnel are deployed on base guard duties, IDAC operations, and Halishahar shifts.`;

content = content.replace(targetFind, targetReplace);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched insights count");
