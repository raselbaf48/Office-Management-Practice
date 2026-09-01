const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

// Update imports
if (!content.includes('Cloud,')) {
  content = content.replace('import { \n  X, ', 'import { \n  X, \n  Cloud,\n  Server,\n');
}

// Update SettingSection
content = content.replace(
  "type SettingSection = 'appearance' | 'logo' | 'users' | 'security' | 'database' | 'history';",
  "type SettingSection = 'appearance' | 'cloudsync' | 'users' | 'security' | 'database' | 'history';"
);

// Update sections array
const oldLogoOption = "    ...(role === 'SUPER_ADMIN' ? [{ id: 'logo', label: 'Unit Crest / Logo', icon: <ImageIcon className=\"w-5 h-5\" />, color: 'text-rose-500 bg-rose-100 dark:bg-rose-950 dark:text-rose-400' }] : []),";
const newSyncOption = "    ...(role === 'SUPER_ADMIN' ? [{ id: 'cloudsync', label: 'Database Cloud Sync', icon: <Cloud className=\"w-5 h-5\" />, color: 'text-blue-500 bg-blue-100 dark:bg-blue-950 dark:text-blue-400' }] : []),";
content = content.replace(oldLogoOption, newSyncOption);

fs.writeFileSync('src/components/SettingsModal.tsx', content);
