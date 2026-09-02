const fs = require('fs');

let current = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

const lines = current.split('\n');
for (let i = lines.length - 20; i < lines.length; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
