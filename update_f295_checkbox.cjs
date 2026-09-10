const fs = require('fs');
const file = 'src/components/AssignLeaveTab.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeF295}
                    onChange={(e) => handleF295Toggle(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                    F-295
                  </span>
                </label>
                {includeF295 && (
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                    +{f295Option === '2' ? '2' : f295Option === '3' ? '3' : f295CustomDays} Days Added (Free Leave)
                  </span>
                )}`;

const replaceCode = `              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center space-x-2.5 cursor-pointer select-none group"
                  onClick={() => handleF295Toggle(!includeF295)}
                >
                  <div className={\`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out \${includeF295 ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400 dark:group-hover:bg-slate-500'}\`}>
                    <span className={\`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out \${includeF295 ? 'translate-x-4.5' : 'translate-x-0.5'}\`} style={{ transform: includeF295 ? 'translateX(18px)' : 'translateX(3px)' }} />
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                    Include F-295 (Journey Time)
                  </span>
                </div>
                {includeF295 && (
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                    +{f295Option === '2' ? '2' : f295Option === '3' ? '3' : f295CustomDays} Days Added
                  </span>
                )}`;

content = content.replace(findCode, replaceCode);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched F-295 UI!");
