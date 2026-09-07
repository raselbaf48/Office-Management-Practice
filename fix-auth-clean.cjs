const fs = require('fs');
let content = fs.readFileSync('src/utils/authSession.ts', 'utf8');

const target = "  const ownerIdx = parsed.findIndex(u => u.bdNo === '48456');";
const replacement = "  const ownerIdx = parsed.findIndex(u => u.bdNo.replace(/^BD\\\\/?/i, '').trim() === '48456');";

content = content.replace(target, replacement);
fs.writeFileSync('src/utils/authSession.ts', content);
