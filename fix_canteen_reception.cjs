const fs = require('fs');
const file = 'src/services/localDatabase.ts';
let content = fs.readFileSync(file, 'utf8');

const targetFind = `        else if (codeStr === 'CANTEEN') {
          if (isPT) {
             return {
                dutyCode: 'RECEPTION',
                idaShift: ass.idaShift,
                proxyForFlight: ass.proxyForFlight,
                disposalScope: scope,
                notes: ass.notes ? \`\${ass.notes} (Canteen)\` : 'Canteen',
                dutyName: 'K/O & Reception',
                previousDutyName,
                statusCategory: 'RECEPTION',
             };
          } else {
             dutyName = 'Canteen';
             statusCategory = 'CANTEEN';
          }
        }`;

const targetReplace = `        else if (codeStr === 'CANTEEN') {
          return {
             dutyCode: 'RECEPTION',
             idaShift: ass.idaShift,
             proxyForFlight: ass.proxyForFlight,
             disposalScope: scope,
             notes: ass.notes ? \`\${ass.notes} (Canteen)\` : 'Canteen',
             dutyName: 'K/O & Reception',
             previousDutyName,
             statusCategory: 'RECEPTION',
          };
        }`;

content = content.replace(targetFind, targetReplace);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched Canteen -> Reception");
