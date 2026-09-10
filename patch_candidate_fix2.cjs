const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\/\/ Ensure airman's flight actually has a quota for this IDAC shift\n\s*if \(\(activeDutyCode === 'IDAC' \|\| activeDutyCode === 'IDA'\) && activeIdaShift\) \{\n\s*const quota = getFlightDutyQuotaForDate\(fromDate, airman\.flightName, 'IDAC', activeIdaShift\);\n\s*if \(quota <= 0\) return false;\n\s*\}/g;

content = content.replace(regex, `// Ensure airman's flight actually has a quota for this IDAC shift (if filterByRatio is ON)
        if (filterByRatio && (activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') && activeIdaShift) {
          const quota = getFlightDutyQuotaForDate(fromDate, airman.flightName, 'IDAC', activeIdaShift);
          if (quota <= 0) return false;
        }`);

fs.writeFileSync(file, content);
