const fs = require('fs');
let lines = fs.readFileSync('src/components/EntryHistoryModal.tsx', 'utf8').split('\n');
lines[539] = '                    </>';
lines.splice(540, 0, '                    )}');
fs.writeFileSync('src/components/EntryHistoryModal.tsx', lines.join('\n'));
