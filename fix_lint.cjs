const fs = require('fs');
let code = fs.readFileSync('src/services/localDatabase.ts', 'utf8');
code = code.replace(/ === 'AIRFIELD_DUTY'/g, " === 'ATT' || d.dutyCode === 'DETT'");
fs.writeFileSync('src/services/localDatabase.ts', code);

code = fs.readFileSync('src/components/AssignDutyModal.tsx', 'utf8');
code = code.replace(/d\.code === 'AIRFIELD_DUTY'/g, "d.code === 'ATT' || d.code === 'DETT'");
fs.writeFileSync('src/components/AssignDutyModal.tsx', code);

code = fs.readFileSync('src/utils/airmanMatcher.ts', 'utf8');
code = code.replace(/'AIRFIELD_DUTY'/g, "'ATT'");
fs.writeFileSync('src/utils/airmanMatcher.ts', code);
