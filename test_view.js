const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

// The headers columns
code = code.replace(
  /<th className="p-2 w-16 min-w-16 font-bold bg-slate-200\/60 dark:bg-slate-700\/60 border-l border-slate-200 dark:border-slate-700 text-center align-middle">\s*Total\s*<\/th>\s*<th className="p-2 w-24 min-w-24 font-bold bg-slate-200\/60 dark:bg-slate-700\/60 border-l border-slate-200 dark:border-slate-700 text-center align-middle">\s*As Per Ratio\s*<\/th>/g,
  `{showTableInfo[tableIdx] ? (
                          <th className="p-2 w-28 min-w-28 font-bold bg-slate-200/60 dark:bg-slate-700/60 border-l border-slate-200 dark:border-slate-700 text-center align-middle leading-tight">
                            Total / Ratio
                          </th>
                        ) : (
                          <th className="p-2 w-16 min-w-16 font-bold bg-slate-200/60 dark:bg-slate-700/60 border-l border-slate-200 dark:border-slate-700 text-center align-middle">
                            Total
                          </th>
                        )}`
);

// The row cells
code = code.replace(
  /<td className="p-2 font-mono font-bold bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 text-center align-middle">\s*\{rowSum\}\s*<\/td>\s*<td className="p-2 font-mono font-bold bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 text-center align-middle">\s*\{table\.flightTargets\?\.\[flight\] \|\| 0\}\s*<\/td>/g,
  `{showTableInfo[tableIdx] ? (
                                <td className="p-2 font-mono font-bold bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 text-center align-middle">
                                  <div className="flex items-center justify-center space-x-1 text-[11px]">
                                    <span className={rowSum !== (table.flightTargets?.[flight] || 0) ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}>{rowSum}</span>
                                    <span className="text-slate-400">/</span>
                                    <span className="text-slate-600 dark:text-slate-400">{table.flightTargets?.[flight] || 0}</span>
                                  </div>
                                </td>
                              ) : (
                                <td className="p-2 font-mono font-bold bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 text-center align-middle text-slate-800 dark:text-slate-200">
                                  {rowSum}
                                </td>
                              )}`
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
