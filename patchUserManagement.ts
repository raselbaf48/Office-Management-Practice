import fs from 'fs';

const path = 'src/components/UserManagementTab.tsx';
let code = fs.readFileSync(path, 'utf8');

// replace inputs and select in the modal
code = code.replace(
  /className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-mono"/g,
  'className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-mono dark:text-white"'
);

code = code.replace(
  /className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2"/g,
  'className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 dark:text-white"'
);

// update role buttons for dark mode
code = code.replace(
  /className=\{`flex-1 py-3 px-4 rounded-xl border \$\{editRole === 'USER' \? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'\}`\}/g,
  "className={`flex-1 py-3 px-4 rounded-xl border transition-colors ${editRole === 'USER' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}"
);

code = code.replace(
  /className=\{`flex-1 py-3 px-4 rounded-xl border \$\{editRole === 'ADMIN' \? 'bg-blue-600 text-white' : 'bg-white text-slate-600'\}`\}/g,
  "className={`flex-1 py-3 px-4 rounded-xl border transition-colors ${editRole === 'ADMIN' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}"
);

code = code.replace(
  /className=\{`flex-1 py-3 px-4 rounded-xl border \$\{editRole === 'SUPER_ADMIN' \? 'bg-amber-500 text-white' : 'bg-white text-slate-600'\}`\}/g,
  "className={`flex-1 py-3 px-4 rounded-xl border transition-colors ${editRole === 'SUPER_ADMIN' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}"
);

fs.writeFileSync(path, code);
