const fs = require('fs');

const files = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/ParadeStateFormattedView.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Remove the isolated isCanteen check
  content = content.replace(/const isCanteen = codeUpper === 'CANTEEN' \|\| notesLower\?\.includes\('canteen'\) \|\| statusCategory === 'CANTEEN';\s*if \(isCanteen\) \{\s*canteenList\.push\(\{ airman, note: 'Canteen' \}\);\s*\}/, '');

  // Add CANTEEN to the if-else chain properly
  content = content.replace(
    /\} else if \(codeUpper === 'CANTEEN'.*?\)\s*\{\s*\/\/ Handled independently\s*\}/s,
    `} else if (codeUpper === 'CANTEEN' || statusCategory === 'CANTEEN') {
         canteenList.push({ airman, note: 'Canteen' });
       }`
  );
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log("Patched Canteen double parsing");
