const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

const regex = /const settingItems: Array<\{[\s\S]*?icon: <Database className="w-5 h-5" \/>\n\s*\}\n\s*\];/;
const newItems = `const settingItems: Array<{
    id: SettingSection;
    title: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'appearance',
      title: 'Theme',
      icon: <Sun className="w-5 h-5" />,
      badge: currentTheme.toUpperCase()
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
      icon: <KeyRound className="w-5 h-5" />,
      badge: role === 'ADMIN' ? 'Admin Active' : 'Protected'
    },
    {
      id: 'history',
      title: 'Login History',
      icon: <History className="w-5 h-5" />,
      badge: \`\${loginHistory.length} Logged\`
    },
    {
      id: 'database',
      title: 'Backup & Restore',
      icon: <Database className="w-5 h-5" />
    }
  ];`;

code = code.replace(regex, newItems);

// Also remove rendering of subtitle
code = code.replace(/<div className="text-\[10px\] text-slate-500 dark:text-slate-400 mt-0\.5 leading-tight">\s*\{item\.subtitle\}\s*<\/div>/g, '');

fs.writeFileSync('src/components/SettingsModal.tsx', code);
