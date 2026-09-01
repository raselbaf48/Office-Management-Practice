const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

const target = `        reception: receptionList.map((i) => i.airman),`;
const replace = `        canteen: canteenList.map((i) => i.airman),\n        reception: receptionList.map((i) => i.airman),`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
  console.log('Patched exportParadeStateSingleDocx call');
} else {
  console.log('Could not find target');
}
