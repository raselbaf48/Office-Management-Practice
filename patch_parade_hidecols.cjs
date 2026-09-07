const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

const target1 = `  initialToDate?: string;`;
const replacement1 = `  initialToDate?: string;
  initialHideEmptyColumns?: boolean;`;
code = code.replace(target1, replacement1);

const target2 = `  onOpenImportModal = () => {},
}) => {`;
const replacement2 = `  initialHideEmptyColumns = false,
  onOpenImportModal = () => {},
}) => {`;
code = code.replace(target2, replacement2);

const target3 = `const [hideEmptyColumns, setHideEmptyColumns] = useState<boolean>(false);`;
const replacement3 = `const [hideEmptyColumns, setHideEmptyColumns] = useState<boolean>(initialHideEmptyColumns);`;
code = code.replace(target3, replacement3);

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
