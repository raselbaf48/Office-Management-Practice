const fs = require('fs');

const files = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/ParadeStateFormattedView.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix 1: Make canteen part of the else if chain
  const targetFind1 = `       const isCanteen = codeUpper === 'CANTEEN' || notesLower?.includes('canteen') || statusCategory === 'CANTEEN';
       if (isCanteen) {
         canteenList.push({ airman, note: 'Canteen' });
       }
       
       if (statusCategory === 'PARADE' || codeUpper === 'ON_PARADE' || isPtIdacA) {`;
       
  const targetReplace1 = `       if (statusCategory === 'PARADE' || codeUpper === 'ON_PARADE' || isPtIdacA) {`;

  const targetFind2 = `} else if (['ABSENT', 'AWL', 'OSL'].includes(codeUpper) || notesLower.includes('absent')) {
         absentList.push({ airman, note: 'Absent' });
       } else if (codeUpper === 'CANTEEN' && !notesLower?.includes('canteen') && statusCategory === 'CANTEEN') {
       // Handled independently 
       } else if (codeUpper === 'DUTY_OFF' || statusCategory === 'OFF') {`;

  const targetReplace2 = `} else if (['ABSENT', 'AWL', 'OSL'].includes(codeUpper) || notesLower.includes('absent')) {
         absentList.push({ airman, note: 'Absent' });
       } else if (codeUpper === 'CANTEEN' || (notesLower.includes('canteen') && codeUpper !== 'RECEPTION') || statusCategory === 'CANTEEN') {
         canteenList.push({ airman, note: 'Canteen' });
       } else if (codeUpper === 'DUTY_OFF' || statusCategory === 'OFF') {`;

  content = content.replace(targetFind1, targetReplace1);
  content = content.replace(targetFind2, targetReplace2);

  fs.writeFileSync(file, content, 'utf8');
});

console.log("Patched parser logic in both files");
