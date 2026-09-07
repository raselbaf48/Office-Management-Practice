const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

const target = `  const handleExportOrPrint = () => {
    document.title = \`\${isPtDocument ? 'PT' : 'Parade'}_State_\${isMultiDay ? 'MultiDay' : fromDate}\`;
    window.print();
  };`;

const replacement = `  const handleExportOrPrint = () => {
    setIsInternalPrintOpen(true);
  };`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
