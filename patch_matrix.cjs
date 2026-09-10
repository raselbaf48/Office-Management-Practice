const fs = require('fs');
const file = 'src/data/officialDutyRatioMatrix.ts';
let content = fs.readFileSync(file, 'utf8');

const findCode = `  if (dutyCode === 'IDAC' || dutyCode === 'IDA') {
    if (shiftLabel === 'Morning') {
      table = matrix.find((t) => t.id === 'idac_mor' || (t.dutyCode === 'IDAC' && t.shiftLabel === 'Morning'));
    } else if (shiftLabel === 'Afternoon') {
      table = matrix.find((t) => t.id === 'idac_an' || (t.dutyCode === 'IDAC' && t.shiftLabel === 'Afternoon'));
    } else if (shiftLabel === 'Night') {
      table = matrix.find((t) => t.id === 'idac_nt' || (t.dutyCode === 'IDAC' && t.shiftLabel === 'Night'));
    } else {
      table = matrix.find((t) => t.dutyCode === 'IDAC');
    }
  }`;

const replaceCode = `  if (dutyCode === 'IDAC' || dutyCode === 'IDA') {
    if (shiftLabel === 'Morning') {
      table = matrix.find((t) => t.id === 'idac_mor' || (t.dutyCode === 'IDAC' && t.shiftLabel === 'Morning'));
    } else if (shiftLabel === 'Afternoon') {
      table = matrix.find((t) => t.id === 'idac_an' || (t.dutyCode === 'IDAC' && t.shiftLabel === 'Afternoon'));
    } else if (shiftLabel === 'Night') {
      table = matrix.find((t) => t.id === 'idac_nt' || (t.dutyCode === 'IDAC' && t.shiftLabel === 'Night'));
    } else {
      // If no shift is selected, we return 0 quota so no flights are auto-selected or shown
      return 0;
    }
  }`;

content = content.replace(findCode, replaceCode);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched getFlightDutyQuotaForDate for IDAC!");
