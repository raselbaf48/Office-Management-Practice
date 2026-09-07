const fs = require('fs');

let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

if (!content.includes('const [hideEmptyColumns, setHideEmptyColumns] = useState(false);') && !content.includes('const [hideEmptyColumns, setHideEmptyColumns] = useState<boolean>(false);')) {
  content = content.replace('const [isInternalPrintOpen, setIsInternalPrintOpen] = useState<boolean>(false);', 'const [isInternalPrintOpen, setIsInternalPrintOpen] = useState<boolean>(false);\n  const [hideEmptyColumns, setHideEmptyColumns] = useState<boolean>(false);');
  fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
  console.log("Added hideEmptyColumns state.");
} else {
  console.log("Already exists.");
}
