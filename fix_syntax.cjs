const fs = require('fs');
let file = fs.readFileSync('src/components/FlgWgHistoryModal.tsx', 'utf-8');
file = file.replace('\\n  const loadLogs = () => {', '\n  const loadLogs = () => {');
fs.writeFileSync('src/components/FlgWgHistoryModal.tsx', file, 'utf-8');
