const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

const startStr = '{/* DISTRIBUTION AS PER MANPOWER */}';
const endStr = '{/* PAGE 2+: Matrices */}';
const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + endStr + content.substring(endIndex + endStr.length);
  fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content);
  console.log("Successfully removed extra tables");
} else {
  console.error("Could not find start or end strings");
}
