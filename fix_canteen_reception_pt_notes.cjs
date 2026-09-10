const fs = require('fs');
const file = 'src/services/localDatabase.ts';
let content = fs.readFileSync(file, 'utf8');

const targetFind = `                notes: ass.notes ? \`\${ass.notes} (Canteen)\` : 'Canteen',
                dutyName: 'K/O & Reception',`;

const targetReplace = `                notes: ass.notes || '',
                dutyName: 'Reception Duty',`;

content = content.replace(targetFind, targetReplace);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched Canteen -> Reception PT notes");
