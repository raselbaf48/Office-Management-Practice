const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardParadeState.tsx', 'utf8');

// The original lines before I broke them:
content = content.replace(/\{\/\* Last Entry Button \(Admin Only\) \*\/\}[\s\S]*?\{\/\* Assign Duty Button \(Admin Only\) \*\/\}/, 
`{/* Last Entry Button (Admin Only) */}
          {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 transition-all shadow-xs"
              title="View Last 10 Entries, undo wrong entries, or edit assignments"
            >
              <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Last Entry</span>
            </button>
          )}

          {/* Assign Duty Button (Admin Only) */}`);

content = content.replace(/\{\/\* Assign Duty Button \(Admin Only\) \*\/\}[\s\S]*?\{\/\* Refresh Button \*\/\}/, 
`{/* Assign Duty Button (Admin Only) */}
          {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 rounded-lg shadow-xs transition-all"
              title="Assign or update duty (GD, Halishahar, Taskforce, etc.)"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Assign Duty</span>
            </button>
          )}

          {/* Refresh Button */}`);

fs.writeFileSync('src/components/DashboardParadeState.tsx', content);
