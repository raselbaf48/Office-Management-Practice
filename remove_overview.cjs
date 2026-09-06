const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

const overviewStart = '{/* PAGE 1: Overview */}';
const overviewEnd = '{/* PAGE 2+: Matrices */}';

const startIndex = content.indexOf(overviewStart);
const endIndex = content.indexOf(overviewEnd);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
  fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content);
  console.log("Successfully removed Overview page");
} else {
  console.error("Could not find start or end strings");
}
