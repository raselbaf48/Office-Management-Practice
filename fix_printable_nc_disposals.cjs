const fs = require('fs');

const file = 'src/components/PrintableNightCountModal.tsx';
if(fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf-8');

  const replaceTargetRegex = /else if \(isBake \|\| isIdacB \|\| isIdacC \|\| codeUpper === 'OFFICE' \|\| notesLower\.includes\('office'\)\) \{[\s\S]*?\} else if \(\['GD'/;

  const newBlock = `else if (isBake || codeUpper === 'CANTEEN' || notesLower.includes('canteen') || codeUpper === 'RECEPTION' || notesLower.includes('reception') || notesLower.includes('k/o')) {
        onPtList.push({ airman, note: '' });
      } else if (isIdacB || isIdacC || codeUpper === 'OFFICE' || notesLower.includes('office')) {
        const dutyDisplay = formatDutyOnShortName(codeUpper, idaShift, notes, item.dutyName);
        dutyOnList.push({ airman, note: 'Office Duty' });
      } else if (['GD'`;

  if (content.match(replaceTargetRegex)) {
    content = content.replace(replaceTargetRegex, newBlock);
  }

  // Clean up previous reception logic to prevent duplication
  content = content.replace(/else if \(codeUpper === 'RECEPTION' \|\| codeUpper === 'CANTEEN' \|\| notesLower\.includes\('reception'\) \|\| notesLower\.includes\('k\/o'\)\) \{\s*receptionList\.push\(\{ airman, note: 'Reception' \}\);\s*\}/g, "");
  content = content.replace(/else if \(codeUpper === 'RECEPTION' \|\| notesLower\.includes\('reception'\) \|\| notesLower\.includes\('k\/o'\)\) \{\s*receptionList\.push\(\{ airman, note: 'Reception' \}\);\s*\}/g, "");


  fs.writeFileSync(file, content, 'utf-8');
  console.log("Printable Night Count Disposals updated");
}
