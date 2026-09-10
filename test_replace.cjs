const fs = require('fs');
const file = 'src/components/DashboardParadeState.tsx';
let content = fs.readFileSync(file, 'utf8');

const dynamicLogic = `
  const disposalsMap = new Map();
  
  if (data?.personnelStatusList) {
    data.personnelStatusList.forEach((p) => {
      if (p.statusCategory === 'PARADE' || p.statusCategory === 'DUTY') return;
      
      let title = p.dutyName || p.dutyCode || 'Other Disposal';
      let cat = p.statusCategory === 'OTHERS' ? p.dutyCode : p.statusCategory;
      let color = 'slate';
      let IconComp = Activity;

      if (p.statusCategory === 'OFF' || p.dutyCode === 'DUTY_OFF') { title = 'Duty Off'; cat = 'DUTY_OFF'; color = 'indigo'; IconComp = Moon; }
      else if (p.statusCategory === 'LEAVE') { title = 'On Leave'; cat = 'LEAVE'; color = 'purple'; IconComp = UserMinus; }
      else if (p.statusCategory === 'TDY') { title = 'TDY / Det'; cat = 'TDY'; color = 'cyan'; IconComp = Plane; }
      else if (p.dutyCode === 'BAKE_N_BITE' || p.statusCategory === 'BAKE_N_BITE') { title = 'Bake & Bite'; cat = 'BAKE_N_BITE'; color = 'rose'; IconComp = Coffee; }
      else if (p.statusCategory === 'SICK_REPORT' || p.dutyCode === 'SICK_REPORT') { title = 'Sick Report'; cat = 'SICK_REPORT'; color = 'red'; IconComp = Plus; }
      else if (p.statusCategory === 'CMH' || p.dutyCode === 'CMH') { title = 'BNS/CMH'; cat = 'CMH'; color = 'red'; IconComp = Plus; }
      else if (p.statusCategory === 'ESSN' || p.dutyCode === 'ESSN') { title = 'Essential Task'; cat = 'ESSN'; color = 'orange'; IconComp = ShieldAlert; }
      else if (p.statusCategory === 'ADMIN_ORDER' || p.dutyCode === 'ADMIN_ORDER') { title = 'Admin Order'; cat = 'ADMIN_ORDER'; color = 'blue'; IconComp = PenTool; }
      else if (p.statusCategory === 'CLASS_TRG' || p.dutyCode === 'CLASS_TRG') { title = 'Class/Trg'; cat = 'CLASS_TRG'; color = 'teal'; IconComp = Calendar; }
      else {
        // Fallback for custom disposals
        cat = p.dutyCode || 'OTHERS';
        color = 'slate';
        IconComp = Activity;
      }

      if (disposalsMap.has(cat)) {
        disposalsMap.get(cat).count++;
      } else {
        disposalsMap.set(cat, { count: 1, category: cat, color, icon: IconComp, title });
      }
    });
  }

  const dynamicDisposals = Array.from(disposalsMap.values());
`;

console.log("Script written.");
