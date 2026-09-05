const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetSection = `    ...(role === 'SUPER_ADMIN' ? [{
      id: 'appManagement',
      label: 'App Management',
      icon: <Monitor className="w-5 h-5" />,
      color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400'
    }] : []),`;

const replacementSection = `    ...(role === 'SUPER_ADMIN' ? [
      { id: 'appNotice', label: 'App Notice', icon: <Megaphone className="w-5 h-5" />, color: 'text-orange-500 bg-orange-100 dark:bg-orange-950 dark:text-orange-400' },
      { id: 'maintenanceMode', label: 'Maintenance Mode', icon: <Wrench className="w-5 h-5" />, color: 'text-red-500 bg-red-100 dark:bg-red-950 dark:text-red-400' }
    ] : []),`;

content = content.replace(targetSection, replacementSection);

fs.writeFileSync(file, content);
