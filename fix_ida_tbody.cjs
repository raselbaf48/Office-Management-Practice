const fs = require('fs');

let code = fs.readFileSync('src/components/IdaCenterDutyView.tsx', 'utf8');

// Remove Time Window column data
const timeWindowRegex = /\{\/\* Time Window \*\/\}\s*<td className="py-3\.5 px-6 font-mono font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap align-top">\s*\{item\.shiftTime\}\s*<\/td>/;
code = code.replace(timeWindowRegex, '');

// Fix colSpan in loading/empty state from 5 to 4
code = code.replace(/colSpan=\{5\}/g, 'colSpan={4}');

fs.writeFileSync('src/components/IdaCenterDutyView.tsx', code);
