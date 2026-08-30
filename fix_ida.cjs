const fs = require('fs');

let code = fs.readFileSync('src/components/IdaCenterDutyView.tsx', 'utf8');

// 1. Change to exactly 3 shifts
code = code.replace(
  /return scheduleList.slice\(nextIdx \+ 1, nextIdx \+ 7\); \/\/ Show next 6 upcoming shifts/g,
  'return scheduleList.slice(nextIdx + 1, nextIdx + 4);'
);
code = code.replace(
  /return scheduleList.slice\(0, 6\);/g,
  'return scheduleList.slice(0, 3);'
);

// 2. Remove "X Scheduled Shifts" text
code = code.replace(
  /<span className="text-xs font-semibold text-slate-500 dark:text-slate-400">\s*\{upcomingTableSchedule\.length\} Scheduled Shifts\s*<\/span>/,
  ''
);

// 3. Remove "Time Window" and change "Action" to "Contact"
code = code.replace(
  /<th className="py-3\.5 px-6">Time Window<\/th>\s*<th className="py-3\.5 px-6 text-right">Action<\/th>/,
  '<th className="py-3.5 px-6 text-right">Contact</th>'
);

// We need to also modify the tbody row to remove the Time Window cell
fs.writeFileSync('src/components/IdaCenterDutyView.tsx', code);
