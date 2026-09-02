import fs from 'fs';

const path = 'src/components/UserManagementTab.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add PINs to Profile Details Box for isOwner
const currentRoleBlock = `<div className="col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Role</p>`;
const pinsBlock = `{isOwner && (
                  <>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">User PIN</p>
                      <p className="text-sm font-mono font-medium text-slate-900 dark:text-white">{selectedUser.password}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Admin PIN</p>
                      <p className="text-sm font-mono font-medium text-slate-900 dark:text-white">{selectedUser.adminPass || '-'}</p>
                    </div>
                  </>
                )}
                <div className="col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Role</p>`;

code = code.replace(currentRoleBlock, pinsBlock);

// 2. Wrap the edit section with isEditingProfile
code = code.replace(
  /<div className="space-y-4">/,
  `{isEditingProfile && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-6 mb-6">
              <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 border-b border-emerald-100 dark:border-emerald-800/50 pb-2">Edit Access & PINs</h3>
              <div className="space-y-4">`
);

code = code.replace(
  /<div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">/,
  `</div>
            )}
            
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">`
);

fs.writeFileSync(path, code);
