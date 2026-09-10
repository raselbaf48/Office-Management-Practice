const fs = require('fs');
const files = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/ParadeStateFormattedView.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace getFlightStats in both files
  const search = `} else if (['ABSENT', 'AWL', 'OSL'].includes(codeUpper) || notesLower.includes('absent')) {\n absentCount++;\n } else if (['GD', 'BTF', 'NTF', 'HALISHAHAR', 'IDAC', 'IDA', 'DUTY_OFF'].includes(codeUpper) || statusCategory === 'DUTY' || statusCategory === 'OFF') {`;
  
  const replace = `} else if (['ABSENT', 'AWL', 'OSL'].includes(codeUpper) || notesLower.includes('absent')) {\n absentCount++;\n } else if (codeUpper === 'CANTEEN' || statusCategory === 'CANTEEN') {\n if (isPtDocument) { koReceptionCount++; } else { canteenCount++; }\n } else if (['GD', 'BTF', 'NTF', 'HALISHAHAR', 'IDAC', 'IDA', 'DUTY_OFF'].includes(codeUpper) || statusCategory === 'DUTY' || statusCategory === 'OFF') {`;

  if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Patched stats in ${file}`);
  } else {
    console.log(`Could not find search string in ${file}`);
  }
});
