const fs = require('fs');
let file = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

// 1. Add 'As Per Ratio' Header
const headerRegex = /<th className="p-2 w-16 bg-slate-200 dark:bg-slate-700">\s*Total\s*<\/th>/;
const newHeader = `<th className="p-2 w-16 bg-slate-200 dark:bg-slate-700 border-l border-slate-300 dark:border-slate-600">
                          Total
                        </th>
                        <th className="p-2 w-24 bg-slate-200 dark:bg-slate-700 border-l border-slate-300 dark:border-slate-600">
                          As Per Ratio
                        </th>`;
file = file.replace(headerRegex, newHeader);

// 2. Add 'As Per Ratio' data cell in flight rows
const rowTotalRegex = /<td className="p-2 font-mono font-black text-emerald-800 dark:text-emerald-300 bg-slate-200\/90 dark:bg-slate-700\/90 border-l border-slate-300 dark:border-slate-700 text-xs">\s*\{rowSum\}\s*<\/td>/;
const newRowTotal = `<td className="p-2 font-mono font-black text-emerald-800 dark:text-emerald-300 bg-slate-200/90 dark:bg-slate-700/90 border-l border-slate-300 dark:border-slate-700 text-xs">
                                  {rowSum}
                                </td>
                                <td className="p-2 text-center font-mono text-slate-700 dark:text-slate-300 border-l border-slate-300 dark:border-slate-700 text-xs">
                                  {table.flightTargets?.[flight]?.toFixed(2) || '0.00'}
                                </td>`;
file = file.replace(rowTotalRegex, newRowTotal);

// 3. Modify Daily Total Row to add empty cell at the end, AND add Daily Allotment Row
const dailyTotalRegex = /<td className="p-2 font-mono font-black text-emerald-800 dark:text-emerald-300 bg-slate-200\/90 dark:bg-slate-700\/90 border-l border-slate-300 dark:border-slate-700 text-xs">\s*\{tableTotal\}\s*<\/td>\s*<\/tr>/;
const newDailyTotalAndAllotment = `<td className="p-2 font-mono font-black text-emerald-800 dark:text-emerald-300 bg-slate-200/90 dark:bg-slate-700/90 border-l border-slate-300 dark:border-slate-700 text-xs">
                          {tableTotal}
                        </td>
                        <td className="border-l border-slate-300 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/90">
                        </td>
                      </tr>
                      {/* Daily Allotment Row */}
                      <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold border-t border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                        <td className="p-2 text-left font-black sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 border-r border-slate-300 dark:border-slate-700">
                          <span className="uppercase text-[11px] font-black tracking-wider text-slate-800 dark:text-slate-200">
                            Daily Allotment
                          </span>
                        </td>
                        {daysArray.map((dayNum, dayIdx) => {
                          const dailySum = flights.reduce((sum, fl) => sum + (table.data[fl]?.[dayIdx] || 0), 0);
                          return (
                            <td key={dayNum} className="p-0.5 border border-slate-200 dark:border-slate-700/70 font-mono font-bold text-slate-700 dark:text-slate-300 text-center text-xs">
                              <span className="inline-block py-1">{dailySum}</span>
                            </td>
                          );
                        })}
                        <td colSpan={2} className="p-2 font-mono font-black text-slate-800 dark:text-slate-200 border-l border-slate-300 dark:border-slate-700 text-xs text-center bg-slate-100/50 dark:bg-slate-800/50">
                          {table.totalRequiredMonth || 0}
                        </td>
                      </tr>`;
file = file.replace(dailyTotalRegex, newDailyTotalAndAllotment);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', file, 'utf-8');
console.log('Matrix View Updated!');
