const fs = require('fs');
let file = fs.readFileSync('src/components/IdaCenterDutyView.tsx', 'utf8');

// The original format is likely `{ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }`
const targetDef = `const currentDateFormatted = typeof window !== 'undefined' ? 
        now.toLocaleDateString('en-GB', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        }) : '';`;

if (file.includes("weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'")) {
    file = file.replace(/weekday:\s*'long',\s*month:\s*'long',\s*day:\s*'numeric',\s*year:\s*'numeric'/g, 
        "weekday: 'long', day: '2-digit', month: 'short'"); // Removes year for this specific display
    fs.writeFileSync('src/components/IdaCenterDutyView.tsx', file);
    console.log("Fixed IdaCenterDutyView date format");
} else if (file.includes("now.toLocaleDateString('en-GB'")) {
    console.log("Found another format string in IdaCenterDutyView");
    file = file.replace(/now\.toLocaleDateString\('en-GB',\s*\{[^}]+\}\)/g, 
        "now.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short' })");
    fs.writeFileSync('src/components/IdaCenterDutyView.tsx', file);
    console.log("Forced new format in IdaCenterDutyView");
} else {
    console.log("Format string not found in IdaCenterDutyView");
}
