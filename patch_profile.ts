import fs from 'fs';

const path = 'src/components/UserManagementTab.tsx';
let code = fs.readFileSync(path, 'utf8');

const profileDetailsHtml = `
            {/* User Profile Info Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Profile Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ser No.</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.serNo}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">User ID</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.cleanBd}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">User Name</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.airman.rank} {selectedUser.airman.name}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile No</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.mobileNo || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Role</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    <span className={\`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider \${
                        selectedUser.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                        selectedUser.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }\`}>
                      {selectedUser.role === 'SUPER_ADMIN' ? 'Super Admin' : selectedUser.role === 'ADMIN' ? 'Admin' : 'User'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
`;

code = code.replace(/<div className="max-w-xl w-full bg-slate-50 dark:bg-slate-800\/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">\s*<div className="space-y-4">/, '<div className="max-w-xl w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">\n' + profileDetailsHtml);

fs.writeFileSync(path, code);
