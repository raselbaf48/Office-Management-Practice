const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const target = ') : (\\n)}';
const target2 = ') : (\\r\\n)}';
const target3 = ') : (\\n  )}';
const target4 = ') : (\\r\\n  )}';

if (code.includes(') : (\\n)}')) code = code.replace(') : (\\n)}', ')}');
else if (code.includes(') : (\\n  )}')) code = code.replace(') : (\\n  )}', ')}');

fs.writeFileSync('src/components/Sidebar.tsx', code.split(') : (\\n)}').join(')}').split(') : (\\n  )}').join(')}'));
