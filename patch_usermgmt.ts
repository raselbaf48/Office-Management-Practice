import fs from 'fs';

const path = 'src/components/UserManagementTab.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace Pass/Password -> PIN in table headers
code = code.replace(/>User Pass</g, '>User PIN<');
code = code.replace(/>Admin Pass</g, '>Admin PIN<');

// Wait, the user said: "User PIN & Admin PIN shudu profile er vetore Box e show korbe."
// Which means REMOVE them from the table.
code = code.replace(/<th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs">User Pass<\/th>/g, '');
code = code.replace(/<th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs">Admin Pass<\/th>/g, '');
code = code.replace(/<td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">\{user.password\}<\/td>/g, '');
code = code.replace(/<td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">\{user.adminPass \|\| '-'\}<\/td>/g, '');

// Rename Labels in Forms
code = code.replace(/Login Password/g, 'User PIN');
code = code.replace(/Admin Passcode/g, 'Admin PIN');

// Also update Add User UI
code = code.replace(/Login Pass/g, 'User PIN');
code = code.replace(/Required for Admin/g, 'Admin PIN');

fs.writeFileSync(path, code);
