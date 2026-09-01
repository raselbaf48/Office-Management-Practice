const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

const suppressTarget = `    if (args.some(arg => typeof arg === 'string' && arg.includes('resource-exhausted'))) return;`;
const suppressReplace = `    if (args.some(arg => typeof arg === 'string' && (arg.includes('resource-exhausted') || arg.includes('maximum backoff delay')))) return;`;

if (code.includes(suppressTarget)) {
  code = code.replace(suppressTarget, suppressReplace);
  fs.writeFileSync('src/firebase.ts', code);
  console.log('Patched backoff delay log');
}
