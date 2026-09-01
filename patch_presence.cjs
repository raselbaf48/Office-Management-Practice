const fs = require('fs');

let presenceService = fs.readFileSync('src/services/presenceService.ts', 'utf-8');
presenceService = presenceService.replace(
  "export const updatePresence = async (bdNo: string, isLoggingOut = false) => {",
  "export const updatePresence = async (bdNo: string, isLoggingOut = false, page = 'Dashboard') => {"
);
presenceService = presenceService.replace(
  "status: 'online'",
  "status: 'online',\n         page: page"
);
fs.writeFileSync('src/services/presenceService.ts', presenceService, 'utf-8');

let authSession = fs.readFileSync('src/utils/authSession.ts', 'utf-8');
authSession = authSession.replace(
  "updatePresence(session.bdNo, true); // logout",
  "updatePresence(session.bdNo, true, ''); // logout"
);
fs.writeFileSync('src/utils/authSession.ts', authSession, 'utf-8');

let appTsx = fs.readFileSync('src/App.tsx', 'utf-8');
const useEffectStr = `
  // Presence Update Interval
  useEffect(() => {
    if (session) {
      updatePresence(session.bdNo, false, activeTab);
      const interval = setInterval(() => {
        updatePresence(session.bdNo, false, activeTab);
      }, 60000); // every 1 min
      return () => clearInterval(interval);
    }
  }, [session, activeTab]);
`;
appTsx = appTsx.replace("  // Initialize app data", useEffectStr + "\n  // Initialize app data");
fs.writeFileSync('src/App.tsx', appTsx, 'utf-8');
console.log("Patched presence logic");
