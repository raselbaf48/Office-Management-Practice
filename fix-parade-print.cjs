const fs = require('fs');
let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

// Replace handleExportOrPrint
const exportFuncTarget = `  const handleExportOrPrint = () => {
    document.title = \`\${isPtDocument ? 'PT' : 'Parade'}_State_\${isMultiDay ? 'MultiDay' : fromDate}\`;
    window.print();
  };`;

const exportFuncReplacement = `  const handleExportOrPrint = () => {
    if (isMultiDay) {
      setIsInternalPrintOpen(true);
    } else {
      if (onOpenPrintModal) {
        onOpenPrintModal();
      } else {
        setIsInternalPrintOpen(true);
      }
    }
  };`;
content = content.replace(exportFuncTarget, exportFuncReplacement);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
