const fs = require('fs');
let file = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

// 1. Add 'As Per Ratio' Header
file = file.replace(
  /<th className="p-2 w-16 min-w-16 font-bold bg-slate-200\/60 dark:bg-slate-700\/60 border-l border-slate-200 dark:border-slate-700">\s*Total\s*<\/th>/,
  `<th className="p-2 w-16 min-w-16 font-bold bg-slate-200/60 dark:bg-slate-700/60 border-l border-slate-200 dark:border-slate-700">
                          Total
                        </th>
                        <th className="p-2 w-24 min-w-24 font-bold bg-slate-200/60 dark:bg-slate-700/60 border-l border-slate-200 dark:border-slate-700">
                          As Per Ratio
                        </th>`
);

// 2. Add 'As Per Ratio' data cell in flight rows
file = file.replace(
  /<td className="p-2 font-mono font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800\/50 border-l border-slate-200 dark:border-slate-700">\s*\{rowSum\}\s*<\/td>/g,
  `<td className="p-2 font-mono font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 border-l border-slate-200 dark:border-slate-700">
                                {rowSum}
                              </td>
                              <td className="p-2 text-center font-mono text-slate-700 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800/50">
                                {table.flightTargets?.[flight]?.toFixed(2) || '0.00'}
                              </td>`
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', file, 'utf-8');
console.log('Matrix View Updated again!');
