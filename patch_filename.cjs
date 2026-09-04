const fs = require('fs');

let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf-8');

// For multi day
content = content.replace(
  /\`Multi_Day_Parade_State_\$\{selectedFlight\}_\$\{formatDateShort\(fromDate\)\}_to_\$\{formatDateShort\(toDate\)\}\.docx\`/g,
  "'Document.docx'"
);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);

let utilContent = fs.readFileSync('src/utils/docxExport.ts', 'utf-8');
utilContent = utilContent.replace(
  /filename \?= \`Parade_State_\$\{data\.flight\}_\$\{data\.dateStr\}\.docx\`/g,
  "filename = 'Document.docx'"
);
fs.writeFileSync('src/utils/docxExport.ts', utilContent);

console.log("Patched docx filename");
