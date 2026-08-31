const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf-8');

const importStr = "import { updatePresence } from './services/presenceService';";
if (!file.includes('presenceService')) {
  file = file.replace("import { NightCountStateView }", importStr + "\\nimport { NightCountStateView }");
}

const heartbeatHook = `  // Presence heartbeat
  useEffect(() => {
    if (userSession) {
      updatePresence(userSession.bdNo); // Initial update
      const interval = setInterval(() => {
        updatePresence(userSession.bdNo);
      }, 3 * 60 * 1000); // Every 3 mins
      return () => clearInterval(interval);
    }
  }, [userSession]);`;

if (!file.includes('Presence heartbeat')) {
  file = file.replace('  // --- State Initialization ---', heartbeatHook + '\\n\\n  // --- State Initialization ---');
}

fs.writeFileSync('src/App.tsx', file, 'utf-8');
