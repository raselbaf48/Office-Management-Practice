const fs = require('fs');

let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

const target = `  const [isInternalPrintOpen, setIsInternalPrintOpen] = useState<boolean>(false);`;
const replacement = `  const [isInternalPrintOpen, setIsInternalPrintOpen] = useState<boolean>(false);\n  const [hideEmptyColumns, setHideEmptyColumns] = useState<boolean>(false);`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
