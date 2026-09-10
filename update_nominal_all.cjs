const fs = require('fs');
const file = 'src/components/NominalRoll.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `{fl === 'All' ? 'All Flights (48)' : \`\${fl} Flight\`}`;
const replaceCode = `{fl === 'All' ? 'All Flights' : \`\${fl} Flight\`}`;

content = content.replace(findCode, replaceCode);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched Nominal Roll All Flights text!");
