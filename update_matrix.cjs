const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

// 1. Update the row cells for the flight
code = code.replace(
  /<td className="p-2 font-mono font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800\/50 border-l border-slate-200 dark:border-slate-700 text-center align-middle">\s*\{rowSum\}\s*<\/td>\s*<td className="p-2 text-center font-mono text-slate-700 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800\/50 align-middle">\s*\{autoTargets\?\.\[flight\]\?\.\[table\.id\]\?\.toFixed\(2\) \|\| table\.flightTargets\?\.\[flight\]\?\.toFixed\(2\) \|\| '0\.00'\}\s*<\/td>/g,
  `{showTableInfo[tableIdx] ? (
                                <td className="p-2 font-mono font-bold bg-slate-50 dark:bg-slate-800/50 border-l border-slate-200 dark:border-slate-700 text-center align-middle">
                                  <div className="flex items-center justify-center space-x-1 text-[11px]">
                                    <span className={rowSum !== Math.round(autoTargets?.[flight]?.[table.id] || table.flightTargets?.[flight] || 0) ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}>{rowSum}</span>
                                    <span className="text-slate-400">/</span>
                                    <span className="text-slate-600 dark:text-slate-400">{Math.round(autoTargets?.[flight]?.[table.id] || table.flightTargets?.[flight] || 0)}</span>
                                  </div>
                                </td>
                              ) : (
                                <td className="p-2 font-mono font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 border-l border-slate-200 dark:border-slate-700 text-center align-middle">
                                  {rowSum}
                                </td>
                              )}`
);

// 2. Update the Daily Total row and remove the Daily Allotment row
const dailyTotalRegex = /\{\/\* Daily Total Row \(Sum across all flights for each day\) \*\/\}\s*<tr className="bg-slate-100\/90 dark:bg-slate-800\/90 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100">[\s\S]*?\{\/\* Daily Allotment Row \*\/\}\s*<tr className="bg-slate-50 dark:bg-slate-800\/50 font-bold border-t border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200">[\s\S]*?<\/tr>/;

const newDailyTotalRow = `{/* Daily Total Row (Sum across all flights for each day) */}
                      <tr className="bg-slate-100/90 dark:bg-slate-800/90 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                        <td className="p-2 text-left font-black sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 border-r border-slate-300 dark:border-slate-700 text-center align-middle">
                          <div className="flex items-center justify-between">
                            <span className="uppercase text-[11px] font-black tracking-wider text-slate-800 dark:text-slate-200">
                              {showTableInfo[tableIdx] ? 'Total / Reqr.' : 'Daily Total'}
                            </span>
                            <span className="text-[9px] px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono font-bold">
                              TOTAL
                            </span>
                          </div>
                        </td>

                        {daysArray.map((dayNum, dayIdx) => {
                          const dailySum = flights.reduce(
                            (sum, fl) => sum + (table.data[fl]?.[dayIdx] || 0),
                            0
                          );
                          const dailyReq = table.dailyRequirements?.[dayIdx] ?? (table.totalRequiredDaily || 0);
                          const isPositive = dailySum > 0;

                          return (
                            <td
                              key={dayNum}
                              className={\`p-0.5 border border-slate-200 dark:border-slate-700/70 font-mono font-black \${
                                isPositive
                                  ? 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200'
                                  : 'text-slate-400 dark:text-slate-600 font-normal'
                              }\`}
                            >
                              {showTableInfo[tableIdx] ? (
                                <div className="flex items-center justify-center space-x-0.5 text-[10px]">
                                  <span className={dailySum !== dailyReq ? 'text-red-600 dark:text-red-400' : ''}>{dailySum}</span>
                                  <span className="text-slate-400 font-normal">/</span>
                                  <span className="text-slate-600 dark:text-slate-400">{dailyReq}</span>
                                </div>
                              ) : (
                                <span className="inline-block py-1 text-xs">{dailySum}</span>
                              )}
                            </td>
                          );
                        })}

                        <td className="p-2 font-mono font-black text-emerald-800 dark:text-emerald-300 bg-slate-200/90 dark:bg-slate-700/90 border-l border-slate-300 dark:border-slate-700 text-xs text-center align-middle">
                          {showTableInfo[tableIdx] ? (
                            <div className="flex items-center justify-center space-x-1">
                              <span className={tableTotal !== (table.totalRequiredMonth || 0) ? 'text-red-600 dark:text-red-400' : ''}>{tableTotal}</span>
                              <span className="text-slate-400 font-normal">/</span>
                              <span className="text-slate-600 dark:text-slate-400">{table.totalRequiredMonth || 0}</span>
                            </div>
                          ) : (
                            tableTotal
                          )}
                        </td>
                      </tr>`;

code = code.replace(dailyTotalRegex, newDailyTotalRow);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
