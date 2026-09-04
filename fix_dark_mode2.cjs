const fs = require('fs');

function restoreClasses(filename) {
    if (!fs.existsSync(filename)) return;
    let content = fs.readFileSync(filename, 'utf-8');
    
    // Remove extra spaces created by earlier regex
    content = content.replace(/ +/g, ' ');

    // ParadeStateFormattedView & PrintableParadeStateModal specific
    content = content.replace(/border-slate-800 print:border-black print:border-black/g, 'border-slate-800 dark:border-white print:border-black');
    content = content.replace(/border-slate-800 print:border-black/g, 'border-slate-800 dark:border-white print:border-black');
    content = content.replace(/border-slate-800 dark:border-white print:border-black dark:border-white print:border-black/g, 'border-slate-800 dark:border-white print:border-black');
    
    content = content.replace(/border-slate-900 print:border-black print:border-black/g, 'border-slate-900 dark:border-white print:border-black');
    content = content.replace(/border-slate-900 print:border-black/g, 'border-slate-900 dark:border-white print:border-black');
    content = content.replace(/border-slate-900 dark:border-white print:border-black dark:border-white print:border-black/g, 'border-slate-900 dark:border-white print:border-black');
    
    content = content.replace(/border-black print:border-black/g, 'border-black dark:border-white print:border-black');
    content = content.replace(/border-black dark:border-white print:border-black dark:border-white print:border-black/g, 'border-black dark:border-white print:border-black');

    content = content.replace(/text-slate-900 print:text-black/g, 'text-slate-900 dark:text-white print:text-black');
    content = content.replace(/text-slate-900 dark:text-white print:text-black print:text-black/g, 'text-slate-900 dark:text-white print:text-black');
    content = content.replace(/text-slate-900 font-bold border-b-2/g, 'text-slate-900 dark:text-white font-bold border-b-2');

    content = content.replace(/bg-white text-black border/g, 'bg-white dark:bg-slate-900 text-black dark:text-slate-100 border');
    content = content.replace(/text-slate-800 p-1/g, 'text-slate-800 dark:text-slate-100 p-1');

    fs.writeFileSync(filename, content);
}

const files = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/PrintableNightCountModal.tsx',
  'src/components/PrintableFlyingWingModal.tsx',
  'src/components/DutyRosterPeriodView.tsx',
  'src/components/DutyListFormattedView.tsx'
];

files.forEach(restoreClasses);
console.log("Ran pass 2 restoration");
