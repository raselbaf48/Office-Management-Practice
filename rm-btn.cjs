const fs = require('fs');
let content = fs.readFileSync('src/components/NominalRoll.tsx', 'utf8');

const regex = /<button\s*onClick=\{\(\) => exportNominalRollDocx\(filteredAirmen\)\}[\s\S]*?<\/button>/;
content = content.replace(regex, '');
fs.writeFileSync('src/components/NominalRoll.tsx', content);
