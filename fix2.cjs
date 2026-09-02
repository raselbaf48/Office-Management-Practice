const fs = require('fs');

let current = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');
current = current.replace(
  'dark:text-white" />\n                      />',
  'dark:text-white" />'
);
fs.writeFileSync('src/components/SettingsModal.tsx', current);
