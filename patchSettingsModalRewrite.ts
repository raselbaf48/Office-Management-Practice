import fs from 'fs';

let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

// 1. Add imports if needed
if (!code.includes('updateAppConfigHistoryItemActiveStatus')) {
  code = code.replace(
    "import { getAppConfig, saveAppConfig, AppConfig, getAppConfigHistory, addAppConfigHistory, AppConfigHistoryItem } from '../utils/appConfig';",
    "import { getAppConfig, saveAppConfig, AppConfig, getAppConfigHistory, addAppConfigHistory, AppConfigHistoryItem, updateAppConfigHistoryItemActiveStatus, deleteAppConfigHistoryItem } from '../utils/appConfig';"
  );
}
if (!code.includes("Clock")) {
  code = code.replace(
    "Megaphone, Wrench } from 'lucide-react';",
    "Megaphone, Wrench, Clock, Trash2 as TrashIcon, Power, PowerOff } from 'lucide-react';"
  );
}

// 2. Add SettingSection type 'appHistory'
code = code.replace(
  "type SettingSection = 'appearance' | 'cloudsync' | 'users' | 'security' | 'database' | 'history' | 'appManagement';",
  "type SettingSection = 'appearance' | 'cloudsync' | 'users' | 'security' | 'database' | 'history' | 'appManagement' | 'appHistory';"
);

// 3. Update sections array
const oldSections = `  const sections = [
    ...(role === 'SUPER_ADMIN' ? [{
      id: 'appManagement',
      label: 'App Management',
      icon: <Megaphone className="w-5 h-5" />
    }] : []),`;
const newSections = `  const sections = [
    ...(role === 'SUPER_ADMIN' ? [{
      id: 'appManagement',
      label: 'App Notice/Maint',
      icon: <Megaphone className="w-5 h-5" />,
      color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400'
    }, {
      id: 'appHistory',
      label: 'App History',
      icon: <History className="w-5 h-5" />,
      color: 'text-slate-500 bg-slate-100 dark:bg-slate-900 dark:text-slate-400'
    }] : []),`;
code = code.replace(oldSections, newSections);

// 4. Update getSectionTitle
code = code.replace(
  "case 'appManagement': return 'App Management';",
  "case 'appManagement': return 'App Notice & Maintenance';\n      case 'appHistory': return 'App History';"
);

fs.writeFileSync('src/components/SettingsModal.tsx', code);
