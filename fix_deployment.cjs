const fs = require('fs');
const file = 'src/services/localDatabase.ts';
let content = fs.readFileSync(file, 'utf8');

const targetFind = `        else if (codeStr === 'ABSENT') {
          dutyName = 'Absent';
          statusCategory = 'ABSENT';
        }`;

const targetReplace = `        else if (codeStr === 'DEPLOYMENT') {
          let dest = ass.notes || 'Deployment';
          if (dest.includes(' - ')) {
            dest = dest.split(' - ')[0].trim();
          }
          dutyName = dest;
          statusCategory = 'OTHERS'; // Treated as dynamic disposal
          
          return {
            dutyCode: dest,
            idaShift: ass.idaShift,
            proxyForFlight: ass.proxyForFlight,
            disposalScope: scope,
            notes: (ass.notes || '').toLowerCase().includes('imported') ? '' : (ass.notes || ''),
            dutyName: ass.notes || dest,
            previousDutyName,
            statusCategory: 'OTHERS'
          };
        }
        else if (codeStr === 'ABSENT') {
          dutyName = 'Absent';
          statusCategory = 'ABSENT';
        }`;

content = content.replace(targetFind, targetReplace);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched localDatabase DEPLOYMENT handling");
