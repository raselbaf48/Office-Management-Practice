const fs = require('fs');
let original = fs.readFileSync('settings_copy.tsx', 'utf8');
let current = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

// I will extract the blocks from original.
const getBlock = (startString, endString) => {
  const start = original.indexOf(startString);
  if (start === -1) return null;
  const end = original.indexOf(endString, start);
  if (end === -1) return null;
  return original.substring(start, end + endString.length);
};

const cloudSyncBlock = getBlock("{activeSection === 'cloudsync' && (", "          )}");
const usersBlock = getBlock("{activeSection === 'users' && role === 'SUPER_ADMIN' && (", "          )}");
// Wait, security was rewritten by me, so I don't use original security.
const databaseBlock = getBlock("{activeSection === 'database' && role === 'SUPER_ADMIN' && (", "          )}");
const historyBlock = getBlock("{activeSection === 'history' && role === 'SUPER_ADMIN' && (", "          )}");

// Now replace the placeholders in `current`
current = current.replace(/\{\/\* Other sections would go here.*?\n\s+\}\)/s, 
  cloudSyncBlock + '\n\n' + usersBlock + '\n\n' + databaseBlock + '\n\n' + historyBlock
);

fs.writeFileSync('src/components/SettingsModal.tsx', current);
console.log('Restored original blocks');
