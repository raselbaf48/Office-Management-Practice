const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

const target = `  useEffect(() => {
 setFromDate(selectedDate);
 setToDate(selectedDate);
 setDisposalFromDate(selectedDate);
 setDisposalToDate(selectedDate);
 }, [selectedDate]);`;

const replacement = `  useEffect(() => {
 if (!initialFromDate) setFromDate(selectedDate);
 if (!initialToDate) setToDate(selectedDate);
 setDisposalFromDate(initialFromDate || selectedDate);
 setDisposalToDate(initialToDate || selectedDate);
 }, [selectedDate, initialFromDate, initialToDate]);`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
