const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf8');

if (!code.includes('addCustomDuty')) {
    code = code.replace("import { Airman, Rank, FlightName } from '../types';", "import { Airman, Rank, FlightName, DutyCategoryCode } from '../types';\nimport { addCustomDuty, CustomDutyConfig } from '../utils/customDuties';");
}

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
console.log("Imports added");
