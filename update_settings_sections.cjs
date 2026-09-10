const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `    ...((role === 'SUPER_ADMIN' || role === 'OWNER') ? [
      { id: 'appNotice', label: 'App Notice', icon: <Megaphone className="w-5 h-5" />, color: 'text-orange-500 bg-orange-100 dark:bg-orange-950 dark:text-orange-400' },
      { id: 'maintenanceMode', label: 'Maintenance Mode', icon: <Wrench className="w-5 h-5" />, color: 'text-red-500 bg-red-100 dark:bg-red-950 dark:text-red-400' }
    ] : []),`;

const replaceCode = `    ...((role === 'SUPER_ADMIN' || role === 'OWNER' || role === 'ADMIN') ? [
      { id: 'appNotice', label: 'App Notice', icon: <Megaphone className="w-5 h-5" />, color: 'text-orange-500 bg-orange-100 dark:bg-orange-950 dark:text-orange-400' },
      { id: 'maintenanceMode', label: 'Maintenance Mode', icon: <Wrench className="w-5 h-5" />, color: 'text-red-500 bg-red-100 dark:bg-red-950 dark:text-red-400' }
    ] : []),`;

content = content.replace(findCode, replaceCode);

const findRole1 = `{log.role === 'OWNER' ? 'Owner' : (log.role === 'SUPER_ADMIN' || log.role === 'OWNER') ? 'Super Admin' : log.role === 'ADMIN' ? 'Admin' : 'User'}`;
const replaceRole1 = `{log.role === 'OWNER' ? 'Owner' : log.role === 'SUPER_ADMIN' ? 'Super Admin' : log.role === 'ADMIN' ? 'Admin' : 'User'}`;
content = content.split(findRole1).join(replaceRole1);

const findRole2 = `{u.role === 'OWNER' ? 'Owner' : (u.role === 'SUPER_ADMIN' || u.role === 'OWNER') ? 'Super Admin' : u.role === 'ADMIN' ? 'Admin' : 'User'}`;
const replaceRole2 = `{u.role === 'OWNER' ? 'Owner' : u.role === 'SUPER_ADMIN' ? 'Super Admin' : u.role === 'ADMIN' ? 'Admin' : 'User'}`;
content = content.split(findRole2).join(replaceRole2);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched SettingsModal sections and roles!");
