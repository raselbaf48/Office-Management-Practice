const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/'AIRFIELD_DUTY'/g, "'ATT'");
code = code.replace(/ === "AIRFIELD_DUTY"/g, " === 'ATT'");
fs.writeFileSync('server.ts', code);
