const fs = require('fs');
let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

content = content.replace("const handleExportOrPrint = () => {\\n    document.title = `${isPtDocument ? 'PT' : 'Parade'}_State_${isMultiDay ? 'MultiDay' : fromDate}`;\\n    window.print();\\n  };", "const handleExportOrPrint = () => {\n    document.title = `${isPtDocument ? 'PT' : 'Parade'}_State_${isMultiDay ? 'MultiDay' : fromDate}`;\n    window.print();\n  };");
fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
