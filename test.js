import fs from 'fs';
const content = fs.readFileSync('src/data/officialDutyRatioMatrix.ts', 'utf8');
console.log(content.includes('getFlightForIdacShift'));
