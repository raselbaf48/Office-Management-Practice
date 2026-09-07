const fs = require('fs');
let code = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf8');

code = code.replace("selectedDate={selectedDate}", "selectedDate={selectedDate} initialFromDate={fromDate} initialToDate={toDate}");

fs.writeFileSync('src/components/NightCountStateView.tsx', code);
