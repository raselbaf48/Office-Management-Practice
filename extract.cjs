const fs = require('fs');
const content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

const startStr = '  useEffect(() => {'; // we can just grab from the first useEffect after dates
const endStr = '  // Compute Flight Stats for Single-Day Summary Matrix';

const endIdx = content.indexOf(endStr);
const startIdx = content.lastIndexOf('  useEffect(() => {\n    setFromDate(selectedDate);', endIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const extracted = content.slice(startIdx, endIdx);
  fs.writeFileSync('extracted.txt', extracted);
  console.log("Extracted successfully.");
} else {
  console.log("Could not find boundaries.");
}
