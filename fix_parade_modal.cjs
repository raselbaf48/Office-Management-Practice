const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

// Replace the statusList grouping
const oldGroupingStart = `      if (statusCategory === 'PARADE' || codeUpper === 'ON_PARADE') {`;
const oldGroupingEnd = `    targetAirmen.forEach((airman) => {`;

const newGrouping = `      if (statusCategory === 'PARADE' || codeUpper === 'ON_PARADE') {
        onPtList.push({ airman, note: '' });
      } else if (codeUpper === 'DUTY_OFF' || statusCategory === 'OFF') {
        const offName = formatDutyOffShortName(item.previousDutyCode, item.previousDutyName, item.dutyName || notes);
        dutyOffList.push({ airman, note: offName });
      } else if (['GD', 'BTF', 'NTF', 'HALISHAHAR', 'IDAC', 'IDA', 'AIRPORT', 'AIRFIELD', 'AIRFIELD_DUTY', 'AIR_FD'].includes(codeUpper) || statusCategory === 'DUTY') {
        const dutyDisplay = formatDutyOnShortName(codeUpper, idaShift, notes, item.dutyName);
        dutyOnList.push({ airman, note: dutyDisplay });
      } else {
        let customKey = item.dutyName || dutyCode || 'OTHER DISPOSAL';
        if (notes) {
          // Sometimes notes holds the custom disposal name if it's entered in custom field
          // but if it's a standard one, dutyName is better.
          // In AssignDuty, custom disposal stores the name in notes.
          if (!['LEAVE', 'ATT', 'TDY', 'DETT', 'BAKE_N_BITE', 'RECEPTION', 'ESSN', 'CMH', 'SICK_REPORT', 'DRILL_CAT_C', 'ADMIN_ORDER', 'CLASS_TRG', 'GAMES', 'ABSENT'].includes(codeUpper)) {
             customKey = notes;
          }
        }
        if (!customDisposalsMap[customKey]) customDisposalsMap[customKey] = [];
        const safeNotes = notes && !notesLower.includes('imported') ? notes : undefined;
        customDisposalsMap[customKey].push({ airman, note: safeNotes });
      }
    });
  } else {
    targetAirmen.forEach((airman) => {`;

let startIndex = code.indexOf(oldGroupingStart);
let endIndex = code.indexOf(oldGroupingEnd, startIndex);
if(startIndex > -1 && endIndex > -1) {
  code = code.substring(0, startIndex) + newGrouping + code.substring(endIndex + oldGroupingEnd.length);
} else {
  console.log("Could not find grouping logic");
}

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
