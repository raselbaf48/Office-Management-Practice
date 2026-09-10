const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\/\/ Ensure airman's flight actually has a quota for this IDAC shift \(unless they are already assigned\)\n\s*if \(\(activeDutyCode === 'IDAC' \|\| activeDutyCode === 'IDA'\) && activeIdaShift\) \{\n\s*const isAssigned = isAirmanAssignedToActiveDuty\(airman\.id\);\n\s*if \(\!isAssigned\) \{\n\s*const quota = getFlightDutyQuotaForDate\(fromDate, airman\.flightName, 'IDAC', activeIdaShift\);\n\s*if \(quota <= 0\) return false;\n\s*\}\n\s*\}\n\s*const isAssigned = isAirmanAssignedToActiveDuty\(airman\.id\);\n\s*if \(isAssigned\) return true;/g;

content = content.replace(regex, `const isAssigned = isAirmanAssignedToActiveDuty(airman.id);
        if (isAssigned) return true;

        // Ensure airman's flight actually has a quota for this IDAC shift
        if ((activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') && activeIdaShift) {
          const quota = getFlightDutyQuotaForDate(fromDate, airman.flightName, 'IDAC', activeIdaShift);
          if (quota <= 0) return false;
        }`);

fs.writeFileSync(file, content);
