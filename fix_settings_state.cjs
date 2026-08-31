const fs = require('fs');
let file = fs.readFileSync('src/components/SettingsModal.tsx', 'utf-8');

file = file.replace(
  "const [historySearch, setHistorySearch] = useState<string>('');",
  `const [historySearch, setHistorySearch] = useState<string>('');
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [realtimeHistory, setRealtimeHistory] = useState<any[]>([]);`
);

file = file.replace(
  "useEffect(() => {",
  `useEffect(() => {
    if (role === 'SUPER_ADMIN') {
      const unsubUsers = subscribeToActiveUsers((users) => {
        setActiveUsers(users);
      });
      const unsubHistory = subscribeToLoginHistory((logs) => {
        setRealtimeHistory(logs);
      });
      return () => {
        unsubUsers();
        unsubHistory();
      };
    }
  }, [role]);

  useEffect(() => {`
);

fs.writeFileSync('src/components/SettingsModal.tsx', file, 'utf-8');
