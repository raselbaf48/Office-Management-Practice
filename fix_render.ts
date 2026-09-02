import fs from 'fs';

const path = 'src/components/UserManagementTab.tsx';
let code = fs.readFileSync(path, 'utf8');

const returnIndex = code.indexOf('  return (');
const closingIndex = code.lastIndexOf('  );');

// Let's first extract the existing parts so we can reassemble them correctly.
// I will just use regex to replace from `return (` to the start of `selectedUser` block.

const newTop = `  return (
    <div className="flex flex-col h-full overflow-hidden animate-fadeIn space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          {isAddingUser ? (
            <button onClick={() => setIsAddingUser(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
              <ChevronLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </button>
          ) : selectedUser ? (
            <button onClick={closeProfile} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
              <ChevronLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {isAddingUser ? 'Add Independent User' : selectedUser ? 'User Profile & Access' : 'User Management'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {isAddingUser ? 'Create a new standalone user account' : selectedUser ? \`BD/\${selectedUser.cleanBd} - \${selectedUser.airman.rank} \${selectedUser.airman.name}\` : 'Manage roles, PINs, and access for all nominal airmen'}
            </p>
          </div>
        </div>
        {!isAddingUser && !selectedUser && isOwner && (
          <button onClick={() => setIsAddingUser(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-sm transition-all">
            + Add User
          </button>
        )}
      </div>

      {isAddingUser ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">User ID (BD No) <span className="text-rose-500">*</span></label>
              <input type="text" value={newUser.bdNo} onChange={(e) => setNewUser({...newUser, bdNo: e.target.value})} className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white" placeholder="e.g. 123456" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Name <span className="text-rose-500">*</span></label>
              <input type="text" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white" placeholder="Full Name" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</label>
              <input type="text" value={newUser.rank} onChange={(e) => setNewUser({...newUser, rank: e.target.value})} className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white" placeholder="Rank" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile No</label>
              <input type="text" value={newUser.mobileNo} onChange={(e) => setNewUser({...newUser, mobileNo: e.target.value})} className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white" placeholder="01XXXXXXXXX" />
            </div>
          </div>
          <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role Access</label>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full md:w-fit">
              <button onClick={() => setNewUser({...newUser, role: 'USER'})} className={\`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all \${newUser.role === 'USER' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}\`}>Standard User</button>
              <button onClick={() => setNewUser({...newUser, role: 'ADMIN'})} className={\`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all \${newUser.role === 'ADMIN' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}\`}>Administrator</button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">User PIN <span className="text-rose-500">*</span></label>
            <input type="text" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full md:w-1/2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 font-mono text-slate-900 dark:text-white" placeholder="User PIN" />
          </div>
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button onClick={() => setIsAddingUser(false)} className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold transition-colors">Cancel</button>
            <button onClick={handleAddUser} className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-sm"><Save className="w-5 h-5" /><span>Save User</span></button>
          </div>
        </div>
      ) : selectedUser ? (
`;

// I need to replace everything from `  return (` to `      ) : selectedUser ? (`
const start = code.indexOf('  return (');
const end = code.indexOf('      ) : selectedUser ? (');
if (start !== -1 && end !== -1) {
  const toReplace = code.substring(start, end + '      ) : selectedUser ? ('.length);
  code = code.replace(toReplace, newTop);
} else {
  console.log("Could not find bounds");
}

fs.writeFileSync(path, code);
