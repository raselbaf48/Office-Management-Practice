const fs = require('fs');
let file = 'src/components/DutyRatioConfigPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

// We need to import DUTY_TYPE_MAP
if (!code.includes("DUTY_TYPE_MAP")) {
  code = code.replace("import { FlightName, Rank } from '../types';", "import { FlightName, Rank } from '../types';\nimport { DUTY_TYPE_MAP } from '../data/dutyTypes';");
}

const oldDistribution = `<td key={t.id} className="border border-slate-400 dark:border-slate-700 px-1 py-1">
                         Total {t.title} ÷ Total<br/>{isSecurity ? 'Cpl & Below' : 'Sgt & Below'}
                       </td>`;

const newDistribution = `<td key={t.id} className="border border-slate-400 dark:border-slate-700 px-1 py-1">
                         Total {t.title} ÷ Total<br/>
                         {(() => {
                           const dutyInfo = DUTY_TYPE_MAP.get(t.dutyCode as any);
                           if (dutyInfo && dutyInfo.eligibleRanks && dutyInfo.eligibleRanks.length > 0) {
                              const RANK_ORDER = ['MWO', 'SWO', 'WO', 'Sgt', 'Cpl', 'LAC', 'AC-1', 'AC-2'];
                              const sorted = [...dutyInfo.eligibleRanks].sort((a, b) => RANK_ORDER.indexOf(a) - RANK_ORDER.indexOf(b));
                              return sorted[0] + ' & Below';
                           }
                           return isSecurity ? 'Cpl & Below' : 'Sgt & Below';
                         })()}
                       </td>`;

if (code.includes('isSecurity ? \'Cpl & Below\' : \'Sgt & Below\'')) {
   code = code.replace(oldDistribution, newDistribution);
   fs.writeFileSync(file, code);
   console.log('Fixed distribution logic');
} else {
   console.log('Could not find distribution logic');
}
