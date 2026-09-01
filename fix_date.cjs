const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

// The original file is calling parseISO or something, and isMultiDay uses fromDate and toDate.
const target = `  const [fromDate, setFromDate] = useState<string>(selectedDate);
  const [toDate, setToDate] = useState<string>(selectedDate);`;
// Wait, I should make `fromDate` and `toDate` match `Date` if `date` was a Date?
// Wait, `selectedDate` is a `string`.
// In ParadeStateFormattedView it uses `const [fromDate, setFromDate] = useState<string>(selectedDate);`
// So it is a string!
