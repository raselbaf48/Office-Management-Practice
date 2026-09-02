const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

// Rename Database Backup -> Backup & Restore
code = code.replace(/label: 'Database Backup'/g, "label: 'Backup & Restore'");

// Remove Firebase data sync option
// We need to look for where Firebase sync is rendered inside activeSection === 'database'
// Let's first dump the database section to see what to replace.
