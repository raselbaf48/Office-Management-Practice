const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');
const arraysStart = code.indexOf('const leaveList: { airman: Airman; note?: string }[] = [];');
console.log(code.substring(arraysStart, arraysStart + 2500));
