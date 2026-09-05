const fs = require('fs');
let file = 'src/components/DutyRatioConfigPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldLogic = `                         {(() => {
                           const dutyInfo = DUTY_TYPE_MAP.get(t.dutyCode as any);
                           if (dutyInfo && dutyInfo.eligibleRanks && dutyInfo.eligibleRanks.length > 0) {
                              const RANK_ORDER = ['MWO', 'SWO', 'WO', 'Sgt', 'Cpl', 'LAC', 'AC-1', 'AC-2'];
                              const sorted = [...dutyInfo.eligibleRanks].sort((a, b) => RANK_ORDER.indexOf(a) - RANK_ORDER.indexOf(b));
                              return sorted[0] + ' & Below';
                           }
                           return isSecurity ? 'Cpl & Below' : 'Sgt & Below';
                         })()}`;

const newLogic = `                         {(() => {
                           const ranksToUse = t.eligibleRanks || DUTY_TYPE_MAP.get(t.dutyCode as any)?.eligibleRanks;
                           if (ranksToUse && ranksToUse.length > 0) {
                              const RANK_ORDER = ['MWO', 'SWO', 'WO', 'Sgt', 'Cpl', 'LAC', 'AC-1', 'AC-2'];
                              const sorted = [...ranksToUse].sort((a, b) => RANK_ORDER.indexOf(a) - RANK_ORDER.indexOf(b));
                              return sorted[0] + ' & Below';
                           }
                           return isSecurity ? 'Cpl & Below' : 'Sgt & Below';
                         })()}`;

if (code.includes('const dutyInfo = DUTY_TYPE_MAP.get(t.dutyCode as any);')) {
   code = code.replace(oldLogic, newLogic);
   fs.writeFileSync(file, code);
   console.log('Fixed distribution logic using t.eligibleRanks');
} else {
   console.log('Could not find logic block');
}
