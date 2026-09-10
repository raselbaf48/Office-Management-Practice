const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `        if (targetFlight !== 'All' && airman.flightName !== targetFlight) return false;`;
const replacementStr = `        if (targetFlight !== 'All' && airman.flightName !== targetFlight) return false;

        // Ensure airman's flight actually has a quota for this IDAC shift (unless they are already assigned)
        if ((activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') && activeIdaShift) {
          const isAssigned = isAirmanAssignedToActiveDuty(airman.id);
          if (!isAssigned) {
            const quota = getFlightDutyQuotaForDate(fromDate, airman.flightName, 'IDAC', activeIdaShift);
            if (quota <= 0) return false;
          }
        }`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(file, content);
