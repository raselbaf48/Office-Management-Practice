const fs = require('fs');
const file = 'src/services/localDatabase.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(`dutyName: ass.notes || dest,`, `dutyName: dest,`);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched localDatabase DEPLOYMENT dutyName");
