const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

const regex = /const handleExportOrPrint = \(\) => \{\s*document\.title = [^;]+;\s*window\.print\(\);\s*\};/g;

code = code.replace(regex, `const handleExportOrPrint = () => { setIsInternalPrintOpen(true); };`);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
