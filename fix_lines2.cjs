const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

lines[719] = '';
lines[720] = '';
lines[818] = '';
lines[819] = '';

fs.writeFileSync(file, lines.join('\n'));
