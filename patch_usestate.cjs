const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

code = code.replace(
  "const [fromDate, setFromDate] = useState<string>(selectedDate || (date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]));",
  "const [fromDate, setFromDate] = useState<string>(initialFromDate || selectedDate || (date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]));"
);

code = code.replace(
  "const [toDate, setToDate] = useState<string>(selectedDate || (date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]));",
  "const [toDate, setToDate] = useState<string>(initialToDate || selectedDate || (date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]));"
);

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
