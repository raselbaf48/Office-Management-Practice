const file = require('fs').readFileSync('src/components/IdaCenterDutyView.tsx', 'utf8');
const match = file.match(/currentDateFormatted || 'Friday, August 28, 2026'/);
if (match) {
    console.log("Found in IdaCenterDutyView");
} else {
    console.log("Not found in IdaCenterDutyView");
}
