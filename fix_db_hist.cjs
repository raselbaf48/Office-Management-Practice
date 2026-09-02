const fs = require('fs');

let current = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

// I will just use Prettier and manually fix the missing `            </div>          )}`
