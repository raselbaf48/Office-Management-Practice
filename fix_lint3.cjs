const fs = require('fs');

let code = fs.readFileSync('src/services/localDatabase.ts', 'utf8');
code = code.replace(/d\.dutyCode === 'AIRFIELD_DUTY'/g, "(d.dutyCode === 'ATT' || d.dutyCode === 'DETT')");
code = code.replace(/a\.dutyCode === 'AIRFIELD_DUTY'/g, "(a.dutyCode === 'ATT' || a.dutyCode === 'DETT')");
fs.writeFileSync('src/services/localDatabase.ts', code);

code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/a\.dutyCode === 'AIRFIELD_DUTY'/g, "(a.dutyCode === 'ATT' || a.dutyCode === 'DETT')");
fs.writeFileSync('server.ts', code);

