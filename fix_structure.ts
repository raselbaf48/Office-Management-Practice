import fs from 'fs';

const path = 'src/components/UserManagementTab.tsx';
let code = fs.readFileSync(path, 'utf8');

// I will just replace the messed up top structure
const oldStr = `  return (
    <div className="flex flex-col h-full overflow-hidden animate-fadeIn space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          
      {isAddingUser ? (`;

const newStr = `  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-6 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          {isAddingUser ? (
            <button 
              onClick={() => setIsAddingUser(false)}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </button>
          ) : selectedUser ? (
            <button 
              onClick={closeProfile}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
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
          <button
            onClick={() => setIsAddingUser(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
          >
            + Add User
          </button>
        )}
      </div>

      {isAddingUser ? (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-start">
          <div className="max-w-xl w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">`;

// Wait, looking at the code I see `isAddingUser ? (` then `<div className="flex flex-col h-full overflow-hidden animate-fadeIn space-y-4">`
// Let me just reconstruct the file carefully.
