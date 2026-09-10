const fs = require('fs');
const file = 'src/components/DashboardParadeState.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetFind = `              else if (p.statusCategory === 'CMH' || p.dutyCode === 'CMH') { title = 'BNS/CMH'; cat = 'CMH'; color = 'red'; IconComp = Plus; subtitle = 'Hospital'; }
              else if (p.statusCategory === 'ESSN' || p.dutyCode === 'ESSN') { title = 'Essential Task'; cat = 'ESSN'; color = 'orange'; IconComp = ShieldAlert; subtitle = 'Task'; }
              else if (p.statusCategory === 'ADMIN_ORDER' || p.dutyCode === 'ADMIN_ORDER') { title = 'Admin Order'; cat = 'ADMIN_ORDER'; color = 'blue'; IconComp = PenTool; subtitle = 'Admin'; }
              else if (p.statusCategory === 'CLASS_TRG' || p.dutyCode === 'CLASS_TRG') { title = 'Class / Trg'; cat = 'CLASS_TRG'; color = 'teal'; IconComp = Calendar; subtitle = 'Training'; }
              else {`;

const targetReplace = `              else if (p.statusCategory === 'CMH' || p.dutyCode === 'CMH') { title = 'BNS/CMH'; cat = 'CMH'; color = 'red'; IconComp = Plus; subtitle = 'Hospital'; }
              else if (p.statusCategory === 'ESSN' || p.dutyCode === 'ESSN') { title = 'Essential Task'; cat = 'ESSN'; color = 'orange'; IconComp = ShieldAlert; subtitle = 'Task'; }
              else if (p.statusCategory === 'ADMIN_ORDER' || p.dutyCode === 'ADMIN_ORDER') { title = 'Admin Order'; cat = 'ADMIN_ORDER'; color = 'blue'; IconComp = PenTool; subtitle = 'Admin'; }
              else if (p.statusCategory === 'CLASS_TRG' || p.dutyCode === 'CLASS_TRG') { title = 'Class / Trg'; cat = 'CLASS_TRG'; color = 'teal'; IconComp = Calendar; subtitle = 'Training'; }
              else if (p.statusCategory === 'CANTEEN' || p.dutyCode === 'CANTEEN') { title = 'Canteen'; cat = 'CANTEEN'; color = 'rose'; IconComp = Coffee; subtitle = 'Mess'; }
              else if (p.statusCategory === 'RECEPTION' || p.dutyCode === 'RECEPTION') { title = 'K/O & Reception'; cat = 'RECEPTION'; color = 'amber'; IconComp = Coffee; subtitle = 'Duty'; }
              else if (p.statusCategory === 'GAMES' || p.dutyCode === 'GAMES') { title = 'G/H & Games'; cat = 'GAMES'; color = 'emerald'; IconComp = Activity; subtitle = 'Sports'; }
              else {`;

content = content.replace(targetFind, targetReplace);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched canteen and reception logic");
