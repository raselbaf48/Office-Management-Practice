const fs = require('fs');
let code = fs.readFileSync('src/utils/docxExport.ts', 'utf8');

const target = `  const secLeave = buildDisposalSection('LEAVE', toDisplay(leave), col2Paragraphs.length === 0);`;
const replace = `  const secCanteen = buildDisposalSection('CANTEEN', toDisplay(params.canteen || []), col2Paragraphs.length === 0);
  if (secCanteen.length > 0) col2Paragraphs.push(...secCanteen);
  const secLeave = buildDisposalSection('LEAVE', toDisplay(leave), col2Paragraphs.length === 0);`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  fs.writeFileSync('src/utils/docxExport.ts', code);
  console.log('Patched canteen into docx disposals');
} else {
  console.log('Target not found in docxExport.ts');
}
