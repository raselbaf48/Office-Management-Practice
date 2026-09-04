const fs = require('fs');

let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf-8');

content = content.replace(
/rightSig: \{ name: a\.name, rank: a\.rank, desig: a\.designation \},[\s\S]*?\}[\s\S]*?\}\);/g,
"rightSig: { name: a.name, rank: a.rank, desig: a.designation },\n    }, 'Document.docx');"
);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);

console.log("Syntax fixed");
