const fs = require('fs');

const file = 'src/components/NightCountStateView.tsx';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace(
  /} else if \(codeUpper === 'RECEPTION' \|\| notesLower\.includes\('reception'\) \|\| notesLower\.includes\('k\/o'\)\) \{/g,
  "} else if (codeUpper === 'RECEPTION' || codeUpper === 'CANTEEN' || notesLower.includes('reception') || notesLower.includes('k/o')) {"
);

fs.writeFileSync(file, content, 'utf-8');

const printFile = 'src/components/PrintableNightCountModal.tsx';
if (fs.existsSync(printFile)) {
  let printContent = fs.readFileSync(printFile, 'utf-8');
  printContent = printContent.replace(
    /} else if \(codeUpper === 'RECEPTION' \|\| notesLower\.includes\('reception'\) \|\| notesLower\.includes\('k\/o'\)\) \{/g,
    "} else if (codeUpper === 'RECEPTION' || codeUpper === 'CANTEEN' || notesLower.includes('reception') || notesLower.includes('k/o')) {"
  );
  fs.writeFileSync(printFile, printContent, 'utf-8');
}

console.log('Patched Canteen to Reception in PT State');
