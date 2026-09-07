const fs = require('fs');
let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

const regex = /const handleExportOrPrint = \(\) => \{[\s\S]*?setIsInternalPrintOpen\(true\);\s*\}\s*\};/;
const replacement = "const handleExportOrPrint = () => {\\n    document.title = `${isPtDocument ? 'PT' : 'Parade'}_State_${isMultiDay ? 'MultiDay' : fromDate}`;\\n    window.print();\\n  };";

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
