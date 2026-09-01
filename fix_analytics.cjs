const fs = require('fs');

let content = fs.readFileSync('src/components/DutyAnalytics.tsx', 'utf-8');

content = content.replace(/data\.airmanStats/g, 'data.dutyStats');
content = content.replace(/data\.conflictAlerts/g, 'data.conflicts');

fs.writeFileSync('src/components/DutyAnalytics.tsx', content, 'utf-8');
console.log("Fixed Duty Analytics data extraction");
