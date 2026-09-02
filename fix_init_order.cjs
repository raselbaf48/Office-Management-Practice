const fs = require('fs');

let assignCode = fs.readFileSync('src/components/AssignDutyModal.tsx', 'utf8');
assignCode = assignCode.replace(
  /const isPastDate = fromDate < new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\];\n  const isReadOnly = isPastDate;\n\n  const \[dateMode, setDateMode\] = useState<'single' \| 'multi'>\('single'\);\n  const \[fromDate, setFromDate\] = useState<string>\(selectedDate \|\| new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]\);/g,
  "const [dateMode, setDateMode] = useState<'single' | 'multi'>('single');\n  const [fromDate, setFromDate] = useState<string>(selectedDate || new Date().toISOString().split('T')[0]);\n\n  const isPastDate = fromDate < new Date().toISOString().split('T')[0];\n  const isReadOnly = isPastDate;"
);
fs.writeFileSync('src/components/AssignDutyModal.tsx', assignCode);
