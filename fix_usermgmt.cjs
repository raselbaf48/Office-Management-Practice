const fs = require('fs');

let code = fs.readFileSync('src/components/UserManagementTab.tsx', 'utf8');

// 1. Add flightFilter state
if (!code.includes('const [flightFilter')) {
  code = code.replace(/const \[roleFilter, setRoleFilter\] = useState<\'ALL\' \| \'USER\' \| \'ADMIN\' \| \'SUPER_ADMIN\'>\(\'ALL\'\);/, 
    "const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN' | 'SUPER_ADMIN'>('ALL');\n  const [flightFilter, setFlightFilter] = useState<string>('ALL');");
}

// 2. Remove Admin restriction
code = code.replace(/const activeAirmen = useMemo\(\(\) => nominalAirmen\.filter\(a => a\.active && \(!\(userSessionRole === 'ADMIN' && userFlight\) \|\| a\.flightName === userFlight\)\), \[nominalAirmen, userSessionRole, userFlight\]\);/, 
  "const activeAirmen = useMemo(() => nominalAirmen.filter(a => a.active), [nominalAirmen]);");

// 3. Update filteredUsers
code = code.replace(/if \(roleFilter !== 'ALL' && u\.role !== roleFilter\) return false;/, 
  "if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;\n      if (flightFilter !== 'ALL' && u.airman.flightName !== flightFilter) return false;");

code = code.replace(/\[mergedUsers, searchQuery, roleFilter\]/, "[mergedUsers, searchQuery, roleFilter, flightFilter]");

// 4. Update UI
// Find the <div className="flex items-center bg-white dark:bg-slate-800 border ..."> and replace with select boxes
const uiRegex = /<div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl w-full sm:w-auto overflow-x-auto custom-scrollbar">[\s\S]*?<\/div>/;

const newUi = `<div className="flex items-center space-x-2 w-full sm:w-auto">
                <select 
                  value={flightFilter}
                  onChange={(e) => setFlightFilter(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="ALL">All Flights</option>
                  <option value="Avionics">Avionics</option>
                  <option value="Mechanics">Mechanics</option>
                  <option value="GCS">GCS</option>
                  <option value="Admin">Admin</option>
                </select>
                <select 
                  value={roleFilter}
                  onChange={(e: any) => setRoleFilter(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>`;

code = code.replace(uiRegex, newUi);

fs.writeFileSync('src/components/UserManagementTab.tsx', code);

