import fs from 'fs';

const path = 'src/components/UserManagementTab.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Heading 'User Profile'
code = code.replace(
  /'User Profile & Access'/g,
  "'User Profile'"
);

// 2. Full details in the box
// Around line 225-240 is the grid
const boxDetailsPattern = /<div className="grid grid-cols-2 gap-4">([\s\S]*?)<div className="col-span-2">/g;

const newBoxDetails = `<div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Ser No</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.airman?.serNo || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">User ID (BD No)</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.cleanBd}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">Rank & Name</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.airman?.rank} {selectedUser.airman?.name || selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Trade</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.airman?.trade || selectedUser.trade || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Mobile No</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.airman?.mobileNo || selectedUser.mobileNo || '-'}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">Flight</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.airman?.flightName || selectedUser.flight || '-'}</p>
                </div>
                {isOwner && (
                  <>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">User PIN</p>
                      <p className="text-sm font-mono font-medium text-slate-900 dark:text-white">{selectedUser.password}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Admin PIN</p>
                      <p className="text-sm font-mono font-medium text-slate-900 dark:text-white">{selectedUser.adminPass || '-'}</p>
                    </div>
                  </>
                )}
                <div className="col-span-1 md:col-span-2">`;

code = code.replace(boxDetailsPattern, newBoxDetails);

// 3. Update table header and body
const tablePattern = /<table className="w-full text-left border-collapse">[\s\S]*?<\/table>/g;
const newTable = `<table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 font-bold text-slate-500 text-xs">SER NO</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-xs">USER ID</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-xs">RANK & NAME</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-xs">ROLE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mergedUsers.map((user, idx) => (
                <tr 
                  key={user.cleanBd || idx} 
                  onClick={() => openProfile(user)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{user.airman?.serNo || '-'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{user.cleanBd}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{user.airman?.rank} {user.airman?.name || user.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={\`px-2 py-1 rounded text-xs font-bold \${user.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-800' : user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}\`}>
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>`;

code = code.replace(tablePattern, newTable);

fs.writeFileSync(path, code);
