const fs = require('fs');
let file = fs.readFileSync('src/components/DutyRatioSettingsModal.tsx', 'utf-8');

// 1st table: DUTY PER PERSON rowSpan=3
file = file.replace(/<th className="([^"]*) text-sm" rowSpan=\{2\}>DUTY PER PERSON<\/th>/, '<th className="$1 text-sm" rowSpan={3}>DUTY PER PERSON</th>');

// 1st table: Remove empty td from formula row
file = file.replace(
  /<tr className="text-\[9px\] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800\/50">\s*<td className="border border-black dark:border-slate-600 px-2 py-2"><\/td>\s*<td className="border border-black dark:border-slate-600 px-1 py-2">Total Sy Duty ÷ Total Cpl & Below<\/td>/,
  `<tr className="text-[9px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">\n                  <td className="border border-black dark:border-slate-600 px-1 py-2">Total Sy Duty ÷ Total Cpl & Below</td>`
);

// 2nd table: DUTY PER FLIGHT rowSpan=2 (already is, but let's make sure)
file = file.replace(/<th className="([^"]*) text-sm" rowSpan=\{3\}>DUTY PER FLIGHT<\/th>/, '<th className="$1 text-sm" rowSpan={2}>DUTY PER FLIGHT</th>');

// Ensure 2nd table formula row has empty td
// It already does, based on our grep, but just to be safe:
// If it doesn't, add it.
if (!file.includes('<td className="border border-black dark:border-slate-600 px-2 py-2"></td>\\n                  <td className="border border-black dark:border-slate-600 px-1 py-2">Per Person Sy Duty x Total Cpl')) {
  file = file.replace(
    /<tr className="text-\[9px\] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800\/50">\s*<td className="border border-black dark:border-slate-600 px-1 py-2">Per Person Sy Duty x Total Cpl & Below of Flight<\/td>/,
    `<tr className="text-[9px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">\n                  <td className="border border-black dark:border-slate-600 px-2 py-2"></td>\n                  <td className="border border-black dark:border-slate-600 px-1 py-2">Per Person Sy Duty x Total Cpl & Below of Flight</td>`
  );
}


fs.writeFileSync('src/components/DutyRatioSettingsModal.tsx', file, 'utf-8');
console.log('Spans updated');
