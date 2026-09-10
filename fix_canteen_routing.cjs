const fs = require('fs');

const files = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/ParadeStateFormattedView.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  const searchStr = `} else if (codeUpper === 'CANTEEN' || statusCategory === 'CANTEEN') {\n         canteenList.push({ airman, note: 'Canteen' });\n       }`;
  const replaceStr = `} else if (codeUpper === 'CANTEEN' || statusCategory === 'CANTEEN') {\n         if (isPtDocument) {\n           receptionList.push({ airman, note: 'Reception Duty' });\n         } else {\n           canteenList.push({ airman, note: 'Canteen' });\n         }\n       }`;
  
  if (content.includes(searchStr)) {
    content = content.replace(searchStr, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Patched ${file}`);
  } else {
    console.log(`Could not find target string in ${file}`);
  }
});
