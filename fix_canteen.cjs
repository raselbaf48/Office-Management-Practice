const fs = require('fs');

const files = [
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/PrintableParadeStateModal.tsx',
  'src/utils/docxExport.ts'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Insert CANTEEN condition right before DUTY_OFF or DUTY
  // Let's find "codeUpper === 'DUTY_OFF'"
  const searchString = `} else if (codeUpper === 'DUTY_OFF'`;
  const replaceString = `} else if (codeUpper === 'CANTEEN' || notesLower?.includes('canteen')) {\n        canteenList.push({ airman, note: 'Canteen' });\n      } else if (codeUpper === 'DUTY_OFF'`;
  
  if (code.includes(searchString)) {
    code = code.replace(searchString, replaceString);
    fs.writeFileSync(file, code);
    console.log('Fixed canteen logic in', file);
  } else {
      // In docxExport.ts, the variable might be different. Let's see.
      console.log('Search string not found in', file);
  }
});
