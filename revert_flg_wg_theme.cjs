const fs = require('fs');
let file = fs.readFileSync('src/components/FlyingWingStateView.tsx', 'utf-8');

// Reverse the specific strings in the main layout (we can leave the modal alone if we want, but it's easier to just replace all)
file = file.replace(/text-slate-900 dark:text-slate-100/g, 'text-black');
file = file.replace(/bg-white dark:bg-slate-900/g, 'bg-white');
file = file.replace(/border-slate-300 dark:border-slate-700/g, 'border-black');
file = file.replace(/border-slate-300 dark:border-slate-600/g, 'border-black');
file = file.replace(/bg-slate-50 dark:bg-slate-800\/50/g, 'bg-slate-50');
file = file.replace(/bg-slate-50 dark:bg-slate-800/g, 'bg-slate-50');
file = file.replace(/bg-slate-100 dark:bg-slate-800/g, 'bg-slate-100');
file = file.replace(/text-slate-900 dark:text-white/g, 'text-black');

// For the Prepared By inputs (Top) we might want to move it to a modal as requested by the user, or keep it in the Action Controls.
// The user requested: "Prepared By Option ta History er pase add hbe like PT State - But aita sudhu Flg wG Page active hole visible hbe"
// Let's remove the whole Prepared By Inputs (Top) block.
file = file.replace(/\{\/\* Prepared By Inputs \(Top\) \*\/\}[\s\S]*?<\/div>\s*<\/div>/, '');

fs.writeFileSync('src/components/FlyingWingStateView.tsx', file, 'utf-8');
