const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf-8');

if (!file.includes('setInterval(() => updatePresence(userSession.bdNo), 60000)')) {
  file = file.replace(/const \[userSession, setUserSession\] = useState<UserSession \| null>\(getCurrentUserSession\(\)\);/, `const [userSession, setUserSession] = useState<UserSession | null>(getCurrentUserSession());

  useEffect(() => {
    if (userSession) {
      updatePresence(userSession.bdNo);
      const interval = setInterval(() => updatePresence(userSession.bdNo), 60000); // update every minute
      return () => clearInterval(interval);
    }
  }, [userSession]);`);
  
  fs.writeFileSync('src/App.tsx', file, 'utf-8');
  console.log('App.tsx presence patched.');
} else {
  console.log('Already patched.');
}
