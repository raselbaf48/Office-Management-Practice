const fs = require('fs');
let file = fs.readFileSync('src/components/DashboardParadeState.tsx', 'utf8');

const targetStr = `{dayName}, {selectedDate} • Unit Strength:`;
const replacementStr = `{dayName}, {dateDisplay} • Unit Strength:`;

if (file.includes(targetStr)) {
  file = file.replace(targetStr, replacementStr);
  fs.writeFileSync('src/components/DashboardParadeState.tsx', file);
  console.log('DashboardParadeState date format updated');
} else {
  console.log('Target string not found in DashboardParadeState');
}

// We also need to fix the "04 Sep 26" to "04 Sep" everywhere, or the specific formatting function.
// Let's check other common files where "2-digit" year might be used.

