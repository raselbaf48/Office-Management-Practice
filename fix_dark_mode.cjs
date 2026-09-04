const fs = require('fs');

function restoreDarkModeClasses(filename) {
    if (!fs.existsSync(filename)) return;
    let content = fs.readFileSync(filename, 'utf-8');
    
    // Simple naive replacements for common patterns in this project based on earlier context
    
    // ParadeStateFormattedView
    if (filename.includes('ParadeStateFormattedView')) {
        // Fix standard borders
        content = content.replace(/border-slate-800 print:border-black/g, 'border-slate-800 dark:border-white print:border-black');
        content = content.replace(/border-slate-900 print:border-black/g, 'border-slate-900 dark:border-white print:border-black');
        
        // Fix text colors
        content = content.replace(/text-slate-900 print:text-black/g, 'text-slate-900 dark:text-white print:text-black');
        content = content.replace(/text-slate-800 print:text-black/g, 'text-slate-800 dark:text-slate-100 print:text-black');
        
        // Fix table rows/headers
        content = content.replace(/<tr className="font-bold text-slate-900 /g, '<tr className="font-bold text-slate-900 dark:text-white ');
        content = content.replace(/<tr className="text-slate-900 /g, '<tr className="text-slate-900 dark:text-white ');
        
        // Main container
        content = content.replace(/bg-white text-black border/g, 'bg-white dark:bg-slate-900 text-black dark:text-slate-100 border');
        content = content.replace(/text-black border border-slate-300 dark:border-slate-700/g, 'text-black dark:text-slate-100 border border-slate-300 dark:border-slate-700');
    }
    
    // PrintableParadeStateModal
    if (filename.includes('PrintableParadeStateModal')) {
        // Main container
        content = content.replace(/className="bg-white text-black border/g, 'className="bg-white dark:bg-slate-900 text-black dark:text-slate-100 border');
        
        // Modals background
        content = content.replace(/bg-white rounded-2xl/g, 'bg-white dark:bg-slate-900 rounded-2xl');
        content = content.replace(/bg-white text-black print:text-black border border-slate-300 rounded-2xl/g, 'bg-white dark:bg-slate-900 text-black dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-2xl');
    }

    // PrintableNightCountModal
    if (filename.includes('PrintableNightCountModal')) {
        content = content.replace(/className="bg-white text-black border/g, 'className="bg-white dark:bg-slate-900 text-black dark:text-slate-100 border');
    }

    fs.writeFileSync(filename, content);
}

const files = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/PrintableNightCountModal.tsx',
  'src/components/DutyRosterPeriodView.tsx'
];

files.forEach(restoreDarkModeClasses);
console.log("Attempted manual class restoration");
