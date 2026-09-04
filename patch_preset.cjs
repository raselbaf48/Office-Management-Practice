const fs = require('fs');

let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf-8');

content = content.replace(
`    if (type === 'today') {
      setFromDate(todayStr);
      setToDate(todayStr);
      setSelectedDate(todayStr);
    } else if (type === '7days') {`,
`    if (type === 'today') {
      setDateMode('single');
      setFromDate(todayStr);
      setToDate(todayStr);
      setSelectedDate(todayStr);
    } else if (type === '7days') {
      setDateMode('multi');`
);

content = content.replace(
`    } else if (type === '15days') {`,
`    } else if (type === '15days') {
      setDateMode('multi');`
);

content = content.replace(
`    } else if (type === 'month') {`,
`    } else if (type === 'month') {
      setDateMode('multi');`
);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
console.log("Patched preset");
