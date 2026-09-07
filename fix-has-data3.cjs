const fs = require('fs');
const lines = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('const hasData = (dutyName: string) => {'));
if (idx !== -1 && lines[idx + 1].includes('return true;')) {
  lines[idx + 1] = lines[idx + 1].replace('return true;', 'if (!hideEmptyColumns) return true;');
  fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', lines.join('\n'));
  console.log('Fixed hasData');
} else {
  console.log('Not found');
}
