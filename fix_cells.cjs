const fs = require('fs');
let file = fs.readFileSync('src/components/DutyRatioSettingsModal.tsx', 'utf-8');

// Fix the rowSpan values in MANPOWER table
file = file.replace(/rowSpan=\{4\}>DUTY PER PERSON<\/th>/, 'rowSpan={2}>DUTY PER PERSON</th>');

// Fix the rowSpan values in FLIGHT table
file = file.replace(/rowSpan=\{3\}>DUTY PER FLIGHT<\/th>/, 'rowSpan={2}>DUTY PER FLIGHT</th>');

// Add empty tds back to Manpower Formula row
file = file.replace(
  /<tr className="text-\[9px\] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800\/50">\s*<td className="border border-black dark:border-slate-600 px-1 py-2">Total Sy Duty ÷ Total Cpl & Below<\/td>/,
  `<tr className="text-[9px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">\n                  <td className="border border-black dark:border-slate-600 px-2 py-2"></td>\n                  <td className="border border-black dark:border-slate-600 px-1 py-2">Total Sy Duty ÷ Total Cpl & Below</td>`
);

// Add empty tds back to Manpower Data row
file = file.replace(
  /<tr className="font-mono text-sm text-slate-800 dark:text-slate-200">\s*<td className="border border-black dark:border-slate-600 px-2 py-1\.5">\{dpp\.syDuty\.toFixed\(2\)\}<\/td>/,
  `<tr className="font-mono text-sm text-slate-800 dark:text-slate-200">\n                  <td className="border border-black dark:border-slate-600 px-2 py-1.5"></td>\n                  <td className="border border-black dark:border-slate-600 px-2 py-1.5">{dpp.syDuty.toFixed(2)}</td>`
);


// Add empty tds back to Flight Formula row
file = file.replace(
  /<tr className="text-\[9px\] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800\/50">\s*<td className="border border-black dark:border-slate-600 px-1 py-2">Per Person Sy Duty x Total Cpl & Below of Flight<\/td>/,
  `<tr className="text-[9px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">\n                  <td className="border border-black dark:border-slate-600 px-2 py-2"></td>\n                  <td className="border border-black dark:border-slate-600 px-1 py-2">Per Person Sy Duty x Total Cpl & Below of Flight</td>`
);

fs.writeFileSync('src/components/DutyRatioSettingsModal.tsx', file, 'utf-8');
console.log('Fixed cells');
