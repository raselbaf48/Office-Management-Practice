const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

code = code.replace(
  /<td className="p-2 text-left font-black sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 border-r border-slate-300 dark:border-slate-700 text-center align-middle">\s*<span className="uppercase text-\[11px\] font-black tracking-wider text-slate-800 dark:text-slate-200">\s*Daily Allotment\s*<\/span>\s*<\/td>\s*\{daysArray\.map\(\(dayNum, dayIdx\) => \{\s*const dailySum = flights\.reduce\(\(sum, fl\) => sum \+ \(table\.data\[fl\]\?\.\[dayIdx\] \|\| 0\), 0\);\s*return \(\s*<td key=\{dayNum\} className="p-0\.5 border border-slate-200 dark:border-slate-700\/70 font-mono font-bold text-slate-700 dark:text-slate-300 text-center text-xs align-middle">\s*<span className="inline-block py-1">\{dailySum\}<\/span>\s*<\/td>\s*\);\s*\}\)\}\s*<td colSpan=\{2\} className="p-2 font-mono font-black text-slate-800 dark:text-slate-200 border-l border-slate-300 dark:border-slate-700 text-xs text-center bg-slate-100\/50 dark:bg-slate-800\/50 align-middle">\s*\{table\.totalRequiredMonth \|\| 0\}\s*<\/td>/g,
  `<td className="p-2 text-left font-black sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 border-r border-slate-300 dark:border-slate-700 text-center align-middle">
                          <span className="uppercase text-[11px] font-black tracking-wider text-slate-800 dark:text-slate-200">
                            {showTableInfo[tableIdx] ? 'Daily Reqr.' : 'Daily Total'}
                          </span>
                        </td>
                        {daysArray.map((dayNum, dayIdx) => {
                          const dailySum = flights.reduce((sum, fl) => sum + (table.data[fl]?.[dayIdx] || 0), 0);
                          const dailyReq = table.dailyRequirements?.[dayIdx] ?? (table.totalRequiredDaily || 0);
                          return (
                            <td key={dayNum} className="p-0.5 border border-slate-200 dark:border-slate-700/70 font-mono font-bold text-slate-700 dark:text-slate-300 text-center text-xs align-middle">
                              {showTableInfo[tableIdx] ? (
                                <div className="flex flex-col items-center justify-center text-[10px] space-y-0.5 py-0.5">
                                  <span className={dailySum !== dailyReq ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}>{dailySum}</span>
                                  <span className="text-slate-300 dark:text-slate-600 border-t border-slate-200 dark:border-slate-700 w-full"></span>
                                  <span className="text-slate-500">{dailyReq}</span>
                                </div>
                              ) : (
                                <span className="inline-block py-1 text-slate-800 dark:text-slate-200">{dailySum}</span>
                              )}
                            </td>
                          );
                        })}
                        <td colSpan={showTableInfo[tableIdx] ? 1 : 2} className="p-2 font-mono font-black text-slate-800 dark:text-slate-200 border-l border-slate-300 dark:border-slate-700 text-xs text-center bg-slate-100/50 dark:bg-slate-800/50 align-middle">
                          {table.totalRequiredMonth || 0}
                        </td>`
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
