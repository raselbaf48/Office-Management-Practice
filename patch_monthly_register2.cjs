const fs = require('fs');

let content = fs.readFileSync('src/components/MonthlyDutyRegister.tsx', 'utf8');

if (!content.includes("getOptimalMinColumnWidth")) {
  content = content.replace(
    "import { exportTableToCSV } from '../utils/csvExport';",
    "import { exportTableToCSV } from '../utils/csvExport';\nimport { getOptimalMinColumnWidth } from '../utils/tableUtils';"
  );
}

// For DUTY_MATRIX Duty Name column
// The header is `<th className="py-2.5 px-3 w-48 sticky left-0 z-30 bg-slate-900 border-r border-slate-800 text-center">`
// Let's modify the <td> instead to force the width
content = content.replace(
  '<td className="py-2 px-3 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 text-left">',
  '<td className="py-2 px-3 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 text-left" style={{ minWidth: getOptimalMinColumnWidth(cat.label, 120, 7, 24) }}>'
);

// For AIRMEN_GRID Rank & Name column
// The header: `<th className="py-3 px-3 min-w-40 sticky left-10 z-30 bg-slate-900 border-r border-slate-800 text-center">`
content = content.replace(
  '<td className="py-2.5 px-3 sticky left-10 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">',
  '<td className="py-2.5 px-3 sticky left-10 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" style={{ minWidth: getOptimalMinColumnWidth(`${airman.rank} ${airman.name}`, 160, 7, 24) }}>'
);

fs.writeFileSync('src/components/MonthlyDutyRegister.tsx', content, 'utf8');
