const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

code = code.replace("date={fromDate}", "initialFromDate={fromDate} initialToDate={toDate}");

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
