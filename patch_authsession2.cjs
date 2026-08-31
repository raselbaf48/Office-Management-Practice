const fs = require('fs');
let file = fs.readFileSync('src/utils/authSession.ts', 'utf-8');

const importStr = "import { logUserLogin, updatePresence } from '../services/presenceService';";
if (!file.includes('presenceService')) {
  file = file.replace('import { Airman,', importStr + '\\nimport { Airman,');
}

// recordLoginLog handles local storage log. Let's add firestore there
file = file.replace(
  'recordLoginLog(airman);',
  `recordLoginLog(airman);
  // Realtime Presence Sync
  logUserLogin({
    bdNo: airman.bdNo.replace(/^BD\\/?/i, '').trim(),
    name: airman.name,
    rank: airman.rank,
    flightName: airman.flightName,
    role: assignedRole
  });`
);

// Clear user session
file = file.replace(
  "localStorage.removeItem(SESSION_KEY);",
  `
    const session = getCurrentUserSession();
    if (session) {
      updatePresence(session.bdNo, true); // logout
    }
    localStorage.removeItem(SESSION_KEY);`
);

fs.writeFileSync('src/utils/authSession.ts', file, 'utf-8');
