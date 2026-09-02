import fs from 'fs';

const path = 'src/components/UserManagementTab.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add isEditingProfile state
code = code.replace(
  /const \[selectedUser, setSelectedUser\] = useState<typeof mergedUsers\[0\] \| null>\(null\);/,
  "const [selectedUser, setSelectedUser] = useState<typeof mergedUsers[0] | null>(null);\n  const [isEditingProfile, setIsEditingProfile] = useState(false);"
);

// 2. Modify openProfile
code = code.replace(
  /setEditAdminPass\(user\.adminPass\);\n  \};/,
  "setEditAdminPass(user.adminPass);\n    setIsEditingProfile(false);\n  };"
);

// 3. Add Settings button to Profile Details Box
const oldProfileBox = `<h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Profile Details</h3>`;
const newProfileBox = `<div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Profile Details</h3>
                {isOwner && (
                  <button 
                    onClick={() => setIsEditingProfile(!isEditingProfile)} 
                    className={\`p-1.5 rounded-lg transition-colors \${isEditingProfile ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : 'hover:bg-slate-100 text-slate-400 dark:hover:bg-slate-800 dark:text-slate-500'}\`}
                    title="Edit Profile"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}
              </div>`;
code = code.replace(oldProfileBox, newProfileBox);

fs.writeFileSync(path, code);
