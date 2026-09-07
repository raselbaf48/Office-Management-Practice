const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

code = code.replace(/initialToDate\?:\s*string;/, "initialToDate?: string;\n  initialHideEmptyColumns?: boolean;");
code = code.replace(/onOpenImportModal\s*=\s*\(\)\s*=>\s*\{\},?\n\}\)\s*=>\s*\{/, "initialHideEmptyColumns = false,\n  onOpenImportModal = () => {},\n}) => {");

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
