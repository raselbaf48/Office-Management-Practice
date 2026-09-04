const fs = require('fs');
let file = fs.readFileSync('src/data/officialDutyRatioMatrix.ts', 'utf8');

const target = `  isDisabled?: boolean;
  flightTargets?: {`;
  
const replacement = `  isDisabled?: boolean;
  eligibleFlights?: import('../types').FlightName[];
  eligibleRanks?: import('../types').Rank[];
  flightTargets?: {`;

if (file.includes(target)) {
    file = file.replace(target, replacement);
    fs.writeFileSync('src/data/officialDutyRatioMatrix.ts', file);
    console.log('Added eligibleFlights and eligibleRanks to DutyRatioTable interface');
} else {
    console.log('Target not found in DutyRatioTable interface');
}
