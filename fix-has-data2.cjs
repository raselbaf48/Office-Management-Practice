const fs = require('fs');
let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');
const target = `  // Hide empty logic
  const hasData = (dutyName: string) => {
    return true;
    return datesInRange.some(dStr => {`;
const replacement = `  // Hide empty logic
  const hasData = (dutyName: string) => {
    if (!hideEmptyColumns) return true;
    return datesInRange.some(dStr => {`;
content = content.replace(target, replacement);
fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
