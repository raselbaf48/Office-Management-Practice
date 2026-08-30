const fs = require('fs');

let code = fs.readFileSync('src/services/localDatabase.ts', 'utf8');
code = code.replace(/\|\| d\.dutyCode === 'DETT'/g, "|| dutyCode === 'DETT'");
code = code.replace(/a\.dutyCode === 'ATT' \|\| dutyCode === 'DETT'/g, "a.dutyCode === 'ATT' || a.dutyCode === 'DETT'");
code = code.replace(/codeStr === 'ATT' \|\| dutyCode === 'DETT'/g, "codeStr === 'ATT' || codeStr === 'DETT'");
code = code.replace(/yestCodeStr === 'ATT' \|\| dutyCode === 'DETT'/g, "yestCodeStr === 'ATT' || yestCodeStr === 'DETT'");
fs.writeFileSync('src/services/localDatabase.ts', code);
