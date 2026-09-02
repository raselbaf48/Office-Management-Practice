import fs from 'fs';
let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

// Update noticeDraft state
code = code.replace(
  "const [noticeDraft, setNoticeDraft] = useState({",
  "const [noticeDraft, setNoticeDraft] = useState({\n    heading: '',"
);

// Update saveNotice handler
code = code.replace(
  "notice: {\n        isActive: true,\n        message: noticeDraft.message,",
  "notice: {\n        isActive: true,\n        heading: noticeDraft.heading || 'Important Notice',\n        message: noticeDraft.message,"
);

code = code.replace(
  "type: 'NOTICE',\n      message: noticeDraft.message,",
  "type: 'NOTICE',\n      heading: noticeDraft.heading || 'Important Notice',\n      message: noticeDraft.message,"
);

code = code.replace(
  "// Reset draft\n    setNoticeDraft({\n      message: '',",
  "// Reset draft\n    setNoticeDraft({\n      heading: '',\n      message: '',"
);

// Update sections array
code = code.replace(
  "type SettingSection = 'appearance' | 'cloudsync' | 'users' | 'security' | 'database' | 'history' | 'appManagement' | 'appHistory';",
  "type SettingSection = 'appearance' | 'cloudsync' | 'users' | 'security' | 'database' | 'history' | 'appNotice' | 'appMaintenance';"
);

const oldSections = `  const sections = [
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

const newSections = `  const sections = [
    ...(role === 'SUPER_ADMIN' ? [{
      id: 'appNotice',
      label: 'App Notice',
      icon: <Megaphone className="w-5 h-5" />,
      color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400'
    }, {
      id: 'appMaintenance',
      label: 'Maintenance Mode',
      icon: <Wrench className="w-5 h-5" />,
      color: 'text-amber-500 bg-amber-100 dark:bg-amber-950 dark:text-amber-400'
    }] : []),`;

code = code.replace(oldSections, newSections);

// update getSectionTitle
code = code.replace(
  "case 'appManagement': return 'App Notice & Maintenance';\n      case 'appHistory': return 'App History';",
  "case 'appNotice': return 'App Notice Management';\n      case 'appMaintenance': return 'Maintenance Mode Management';"
);

fs.writeFileSync('src/components/SettingsModal.tsx', code);
console.log("Subtabs initial patch applied");
