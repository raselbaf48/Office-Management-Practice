const fs = require('fs');
let content = fs.readFileSync('src/services/localDatabase.ts', 'utf8');

// 1. Add CANTEEN mapping in resolveEffectiveAssignment
const targetCanteen = `        else if (codeStr === 'ABSENT') {
          dutyName = 'Absent';
          statusCategory = 'ABSENT';
        }`;
const replacementCanteen = `        else if (codeStr === 'CANTEEN') {
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
        }
        else if (codeStr === 'ABSENT') {
          dutyName = 'Absent';
          statusCategory = 'ABSENT';
        }`;

content = content.replace(targetCanteen, replacementCanteen);

// 2. Modify assignDuty to allow parallel Canteen duty
const targetAssignDuty = `    const prevAssignment = index >= 0 ? { ...list[index] } : null;

    const newAss: DutyAssignment = {
      ...assignment,
      updatedAt: new Date().toISOString(),
    };`;

const replacementAssignDuty = `    const prevAssignment = index >= 0 ? { ...list[index] } : null;

    let finalDutyCode = assignment.dutyCode;
    let finalNotes = assignment.notes || '';

    if (prevAssignment) {
      const isNewCanteen = assignment.dutyCode === 'CANTEEN';
      const isPrevCanteen = prevAssignment.dutyCode === 'CANTEEN' || (prevAssignment.notes || '').toLowerCase().includes('canteen');
      const isNewClear = assignment.dutyCode === 'ON_PARADE'; // Sometimes 'ON_PARADE' is used to clear duty

      if (!isNewClear) {
        if (isNewCanteen && prevAssignment.dutyCode !== 'CANTEEN') {
           finalDutyCode = prevAssignment.dutyCode; // Keep old duty as primary
           if (!finalNotes.toLowerCase().includes('canteen')) {
              finalNotes = finalNotes ? \`\${finalNotes}, Canteen\` : 'Canteen';
           }
        } else if (!isNewCanteen && isPrevCanteen) {
           finalDutyCode = assignment.dutyCode; // Overwrite primary duty
           if (!finalNotes.toLowerCase().includes('canteen')) {
              finalNotes = finalNotes ? \`\${finalNotes}, Canteen\` : 'Canteen';
           }
        }
      }
    }

    const newAss: DutyAssignment = {
      ...assignment,
      dutyCode: finalDutyCode,
      notes: finalNotes,
      updatedAt: new Date().toISOString(),
    };`;

content = content.replace(targetAssignDuty, replacementAssignDuty);

fs.writeFileSync('src/services/localDatabase.ts', content, 'utf8');
