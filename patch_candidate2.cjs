const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `        if (targetFlight !== 'All' && airman.flightName !== targetFlight) return false;`;
const replacementStr = `        if (targetFlight !== 'All' && airman.flightName !== targetFlight) return false;

        // If IDAC duty is selected but no shift is selected, show empty list
        if ((activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') && !activeIdaShift) {
           return false;
        }`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(file, content);
