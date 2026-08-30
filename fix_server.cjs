const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// Inside resolveEffectiveAssignment
// We want to add: else if (codeStr === 'OTHERS') { statusCategory = 'OTHERS'; }
code = code.replace(
  /else if \(codeStr === 'ABSENT'\) {\n\s+dutyName = 'Absent';\n\s+statusCategory = 'ABSENT';\n\s+}/,
  `else if (codeStr === 'ABSENT') {\n          dutyName = 'Absent';\n          statusCategory = 'ABSENT';\n        }\n        else if (codeStr === 'OTHERS') {\n          dutyName = ass.notes || 'Other Disposal';\n          statusCategory = 'OTHERS';\n        }`
);

fs.writeFileSync('server.ts', code);
