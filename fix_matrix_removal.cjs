const fs = require('fs');
let code = fs.readFileSync('src/data/officialDutyRatioMatrix.ts', 'utf8');

const oldLogic = `        let finalMatrix = updatedParsed;
        if (missing.length > 0) {
          finalMatrix = [...updatedParsed, ...missing];
        }
        
        // Dynamically append custom duties if they are missing`;

const newLogic = `        const customDuties = getCustomDuties();
        const validCustomIds = new Set(customDuties.map(cd => cd.code.toLowerCase() + '_duty'));
        const officialIds = new Set(INITIAL_OFFICIAL_DUTY_MATRIX.map(t => t.id));
        
        // Filter out deleted custom duties
        let finalMatrix = updatedParsed.filter(t => officialIds.has(t.id) || validCustomIds.has(t.id));
        
        if (missing.length > 0) {
          finalMatrix = [...finalMatrix, ...missing];
        }
        
        // Dynamically append custom duties if they are missing`;

if (code.includes(oldLogic)) {
  code = code.replace(oldLogic, newLogic);
  fs.writeFileSync('src/data/officialDutyRatioMatrix.ts', code);
  console.log('Fixed deleted custom duties bug');
}
