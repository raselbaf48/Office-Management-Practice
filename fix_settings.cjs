const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /        \)\r?\n\s*\{activeSection === 'users'/;
content = content.replace(regex, "        )}\n        \n        {activeSection === 'users'");

fs.writeFileSync(file, content);
