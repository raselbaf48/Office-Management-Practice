const fs = require('fs');
let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

content = content.replace(
  /const handleExportOrPrint = \(\) => \{[\s\S]*?setIsInternalPrintOpen\(true\);\s*\}\s*\};\n/,
  \`const handleExportOrPrint = () => {
    document.title = \\\`\\\${isPtDocument ? 'PT' : 'Parade'}_State_\\\${isMultiDay ? 'MultiDay' : fromDate}\\\`;
    window.print();
  };\n\`
);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
