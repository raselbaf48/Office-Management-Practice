import fs from 'fs';

const path = 'src/components/UserManagementTab.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /                \)}\n              <\/div>\n            \)}\n            <div className="space-y-2">/,
  `                )}\n              </div>\n            <div className="space-y-2">`
);

code = code.replace(
  /               <\/select>\n            <\/div>\n            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">/,
  `               </select>\n            </div>\n            </div>\n            )}\n            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">`
);

fs.writeFileSync(path, code);
