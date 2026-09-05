const fs = require('fs');
let file = 'src/components/DutyRatioConfigPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("import { DUTY_TYPE_MAP } from '../data/dutyTypes';")) {
  code = "import { DUTY_TYPE_MAP } from '../data/dutyTypes';\n" + code;
  fs.writeFileSync(file, code);
  console.log("Added import");
}
