const fs = require('fs');

let content = fs.readFileSync('src/components/SettingsModal.tsx', 'utf-8');

// 1. Remove Super Admin check for presence/history
content = content.replace("if (role === 'SUPER_ADMIN') {", "if (true) {");

// 2. Add page name to active users display
content = content.replace(
  "{u.rank} {u.name} (BD/{u.bdNo})</span>",
  "{u.rank} {u.name} (BD/{u.bdNo}) - {u.page || 'Dashboard'}</span>"
);

// 3. Remove clear history button
// The user said: "Login History remove korar option thakbe na"
// So I will remove `clearLoginHistory()` button.
// Search for "Clear History" and remove the button block
content = content.replace(
  /<button[^>]*onClick=\{handleClearHistory\}[^>]*>[\s\S]*?<\/button>/,
  ""
);
content = content.replace(
  /const handleClearHistory = \(\) => \{[\s\S]*?\};/,
  ""
);

// 4. Change Admin Dashboard to just Activity & Settings or something, or move Active Users so everyone sees it.
// Right now it's inside `{isSettingsOpen && (role === 'ADMIN' || role === 'SUPER_ADMIN') && (`
// Let's change that to `{isSettingsOpen && (` so everyone can see it.
content = content.replace(
  /\{isSettingsOpen && \(role === 'ADMIN' \|\| role === 'SUPER_ADMIN'\) && \(/,
  "{isSettingsOpen && ("
);

// And we should hide the passcode parts if not super admin.
// Look for "Admin Passcode Settings"
content = content.replace(
  /<div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 mb-4">[\s\S]*?<h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">[\s\S]*?Admin Passcode Settings[\s\S]*?<\/div>\s*<\/div>/,
  (match) => {
    return `{role === 'SUPER_ADMIN' && (\n${match}\n)}`;
  }
);

// Wait, let's just make the passcode hidden by doing this:
content = content.replace(
  /<h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">\s*<Lock className="w-4 h-4 text-slate-500" \/>\s*Admin Passcodes\s*<\/h3>/,
  "{role === 'SUPER_ADMIN' && <><h3 className=\"text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2\"><Lock className=\"w-4 h-4 text-slate-500\" />Admin Passcodes</h3>"
);

fs.writeFileSync('src/components/SettingsModal.tsx', content, 'utf-8');
console.log('Patched SettingsModal.tsx');
