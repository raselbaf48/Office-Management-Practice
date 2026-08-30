const fs = require('fs');

let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

const regex = /const tabs = \[\s*\{[\s\S]*?\}\s*\];/;
const newTabs = `const tabs = [
    {
      id: 'general',
      title: 'Theme',
      icon: <Monitor className="w-5 h-5" />,
    },
    {
      id: 'users',
      title: 'User Login Access',
      icon: <ShieldCheck className="w-5 h-5" />,
      badge: \`\${detailedUsersList.length} Users\`
    },
    {
      id: 'security',
      title: 'Change Password',
      icon: <Lock className="w-5 h-5" />,
    },
    {
      id: 'history',
      title: 'Login History',
      icon: <History className="w-5 h-5" />,
      badge: \`\${loginHistory.length}\`
    },
    {
      id: 'backup',
      title: 'Backup & Restore',
      icon: <Database className="w-5 h-5" />,
    }
  ];`;

code = code.replace(regex, newTabs);

fs.writeFileSync('src/components/SettingsModal.tsx', code);
