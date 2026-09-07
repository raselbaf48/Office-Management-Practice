const fs = require('fs');
let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

content = content.replace("onOpenImportModal?: () => void;\\n}", "onOpenImportModal?: () => void;\\n  isPrintMode?: boolean;\\n  onClosePrintMode?: () => void;\\n}");
content = content.replace("onOpenImportModal,\\n}) => {", "onOpenImportModal,\\n  isPrintMode = false,\\n  onClosePrintMode,\\n}) => {");

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
