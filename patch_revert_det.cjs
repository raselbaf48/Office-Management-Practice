const fs = require('fs');
const path = 'src/components/FlyingWingStateView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/Det\/ Tdy/g, 'Det/Tdy');

fs.writeFileSync(path, code);
