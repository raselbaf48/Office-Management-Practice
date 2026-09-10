const fs = require('fs');
function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Extract Canteen list pushing out of the exclusive if-else chain
  const targetLogic = `} else if (codeUpper === 'CANTEEN' || notesLower?.includes('canteen')) {
          canteenList.push({ airman, note: 'Canteen' });
        } else if (codeUpper === 'DUTY_OFF' || statusCategory === 'OFF') {`;

  const replacementLogic = `} else if (codeUpper === 'CANTEEN' && !notesLower?.includes('canteen') && statusCategory === 'CANTEEN') {
          // Only push to canteen here if they strictly ONLY have Canteen duty
          // because if they have Canteen + GD, they should go to GD below.
        } else if (codeUpper === 'DUTY_OFF' || statusCategory === 'OFF') {`;

  content = content.replace(targetLogic, replacementLogic);

  // Now, inject the independent Canteen check before the exclusive chain
  const targetChainStart = `const isPtIdacA = isPtDocument && codeUpper === 'IDAC' && idaShift === 'Morning';

        if (statusCategory === 'PARADE' || codeUpper === 'ON_PARADE' || isPtIdacA) {`;
        
  const replacementChainStart = `const isPtIdacA = isPtDocument && codeUpper === 'IDAC' && idaShift === 'Morning';

        const isCanteen = codeUpper === 'CANTEEN' || notesLower?.includes('canteen') || statusCategory === 'CANTEEN';
        if (isCanteen) {
          canteenList.push({ airman, note: 'Canteen' });
        }

        if (statusCategory === 'PARADE' || codeUpper === 'ON_PARADE' || isPtIdacA) {`;

  content = content.replace(targetChainStart, replacementChainStart);
  
  // To avoid `canteenList` being doubly-counted in total if it was handled as a primary duty,
  // we need to make sure if they ONLY had CANTEEN, they don't just fall into "OTHERS".
  // Let's modify the above replacement slightly. Wait, if `codeUpper === 'CANTEEN'` they will fall into `OTHERS` in the if-else chain!
  // To fix this, if their PRIMARY duty is Canteen, we can just skip pushing them to OTHERS.
  const targetOthers = `if (!['LEAVE', 'ATT', 'TDY', 'DETT', 'BAKE_N_BITE', 'RECEPTION', 'ESSN', 'CMH', 'BNS', 'BSH', 'SICK_REPORT', 'ED', 'ADMIN_ORDER', 'CLASS_TRG', 'GAMES', 'ABSENT'].includes(codeUpper)) {`;
  const replacementOthers = `if (!['LEAVE', 'ATT', 'TDY', 'DETT', 'BAKE_N_BITE', 'RECEPTION', 'ESSN', 'CMH', 'BNS', 'BSH', 'SICK_REPORT', 'ED', 'ADMIN_ORDER', 'CLASS_TRG', 'GAMES', 'ABSENT', 'CANTEEN'].includes(codeUpper)) {`;
  
  content = content.replace(targetOthers, replacementOthers);

  fs.writeFileSync(filePath, content, 'utf8');
}

updateFile('src/components/ParadeStateFormattedView.tsx');
updateFile('src/components/PrintableParadeStateModal.tsx');
updateFile('src/components/PrintableNightCountModal.tsx');
