const fs = require('fs');

let code = fs.readFileSync('src/components/AssignDutyModal.tsx', 'utf8');

const regex = /\{\(\['All', 'Avionics', 'Mechanics', 'GCS', 'Admin'\] as \(FlightName \| 'All'\)\[\]\)\.map\(\(flt\) => \{\s*if \(isAdmin && adminFlight && flt !== adminFlight\) return null;\s*return \(\s*<button([\s\S]*?)<\/button>\s*\);\s*\}\)\}/m;

const replacement = `{(['All', 'Avionics', 'Mechanics', 'GCS', 'Admin'] as (FlightName | 'All')[]).map((flt) => {
                const isDisabledFlt = (isAdmin && adminFlight && flt !== adminFlight) || (isAdmin && isPastDate);
                return (
                <button
                  key={flt}
                  type="button"
                  onClick={() => !isDisabledFlt && setActiveFlight(flt)}
                  disabled={isDisabledFlt}
                  className={\`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all \${
                    isDisabledFlt ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700' :
                    activeFlight === flt
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs cursor-pointer'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400 cursor-pointer'
                  }\`}
                >
                  {flt}
                </button>
                );
              })}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/AssignDutyModal.tsx', code);
