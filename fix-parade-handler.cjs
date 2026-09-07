const fs = require('fs');
let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

const t = "  const handleExportOrPrint = () => {\\n    document.title = `${isPtDocument ? 'PT' : 'Parade'}_State_${isMultiDay ? 'MultiDay' : fromDate}`;\\n    window.print();\\n  };";
const r = "  const handleExportOrPrint = () => {\\n    if (onOpenPrintModal) {\\n      onOpenPrintModal();\\n    } else {\\n      setIsInternalPrintOpen(true);\\n    }\\n  };";

content = content.replace(t, r);
fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
