const fs = require('fs');
let code = fs.readFileSync('src/data/officialDutyRatioMatrix.ts', 'utf8');

const oldInterface = /totalRequiredMonth: number;\n  totalRequiredDaily\?: number;/;
const newInterface = `totalRequiredMonth: number;
  totalRequiredDaily?: number;
  flightTargets?: {
    Mechanics?: number;
    Avionics?: number;
    GCS?: number;
  };`;

code = code.replace(oldInterface, newInterface);
fs.writeFileSync('src/data/officialDutyRatioMatrix.ts', code);
