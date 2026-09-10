const fs = require('fs');
const file = 'src/components/UserManagementTab.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value as any)} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none h-10"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>`;

const replaceCode = `              <select 
                value={flightFilter} 
                onChange={(e) => setFlightFilter(e.target.value)} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none h-10"
              >
                <option value="ALL">All Flights</option>
                <option value="Avionics">Avionics</option>
                <option value="Line">Line</option>
                <option value="Servicing">Servicing</option>
                <option value="Out Of Flt">Out Of Flt</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Admin">Admin</option>
                <option value="Supply">Supply</option>
              </select>
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value as any)} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none h-10"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>`;

content = content.replace(findCode, replaceCode);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched UserManagementTab filters!");
