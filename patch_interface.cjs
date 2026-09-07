const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

const target = `  onOpenImportModal?: () => void;
}`;
const replacement = `  initialFromDate?: string;
  initialToDate?: string;
  initialHideEmptyColumns?: boolean;
  onOpenImportModal?: () => void;
}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
