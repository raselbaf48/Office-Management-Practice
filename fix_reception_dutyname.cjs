const fs = require('fs');
const file = 'src/services/localDatabase.ts';
let content = fs.readFileSync(file, 'utf8');

const targetFind = `        else if (codeStr === 'RECEPTION') {
          dutyName = 'K/O & Reception';
          statusCategory = 'RECEPTION';
        }`;

const targetReplace = `        else if (codeStr === 'RECEPTION') {
          dutyName = isPT ? 'Reception Duty' : 'K/O & Reception';
          statusCategory = 'RECEPTION';
        }`;

content = content.replace(targetFind, targetReplace);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched Reception Dutyname");
