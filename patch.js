const fs = require('fs');
let code = fs.readFileSync('src/components/AssignDutyModal.tsx', 'utf8');
code = code.replace(
  "const ratioFiltered = allDuties.filter((dt) => getRequiredCountForDuty(dt.code) > 0);",
  `const ratioFiltered = allDuties.filter((dt) => {
    const req = getRequiredCountForDuty(dt.code);
    const assignedCount = assignmentsList.filter(a => {
      if (activeFlight !== 'All') {
        const airman = airmanMap.get(a.airmanId);
        if (airman && airman.flightName !== activeFlight) return false;
      }
      if (dt.code === 'ATT' || dt.code === 'AIRPORT') {
        return a.dutyCode === 'ATT' || a.dutyCode === 'AIRPORT';
      }
      if (dt.code === 'IDAC' || dt.code === 'IDA') {
        return a.dutyCode === 'IDAC' || a.dutyCode === 'IDA';
      }
      return a.dutyCode === dt.code;
    }).length;
    return req > 0 || assignedCount > 0;
  });`
);
fs.writeFileSync('src/components/AssignDutyModal.tsx', code);
