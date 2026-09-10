const fs = require('fs');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(
    /\} else if \(codeUpper === 'CANTEEN'[^\n]*\)\s*\{\s*\/\/\s*Handled independently else if \(codeUpper === 'DUTY_OFF'/g,
    `} else if (codeUpper === 'CANTEEN' && !notesLower?.includes('canteen') && statusCategory === 'CANTEEN') {
        // Handled independently 
        } else if (codeUpper === 'DUTY_OFF'`
  );
  fs.writeFileSync(filePath, content, 'utf8');
}

updateFile('src/components/ParadeStateFormattedView.tsx');
updateFile('src/components/PrintableParadeStateModal.tsx');
