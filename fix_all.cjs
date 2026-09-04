const fs = require('fs');
const glob = require('fs').readdirSync;

function fixContent(content) {
    // Basic structural fixes for missing dark classes
    content = content.replace(/className="bg-white border/g, 'className="bg-white dark:bg-slate-900 border');
    content = content.replace(/className="bg-white text-black/g, 'className="bg-white dark:bg-slate-900 text-black dark:text-slate-100');
    content = content.replace(/className="bg-white rounded-2xl/g, 'className="bg-white dark:bg-slate-900 rounded-2xl');
    
    // Fix text colors
    content = content.replace(/text-slate-900(?! dark:)/g, 'text-slate-900 dark:text-white');
    content = content.replace(/text-slate-800(?! dark:)/g, 'text-slate-800 dark:text-slate-200');
    content = content.replace(/border-slate-800(?! dark:)/g, 'border-slate-800 dark:border-slate-700');
    content = content.replace(/border-slate-200(?! dark:)/g, 'border-slate-200 dark:border-slate-700');
    content = content.replace(/border-slate-300(?! dark:)/g, 'border-slate-300 dark:border-slate-700');
    content = content.replace(/border-slate-900(?! dark:)/g, 'border-slate-900 dark:border-slate-600');

    // Clean up possible duplicates from over-application
    content = content.replace(/dark:text-white dark:text-white/g, 'dark:text-white');
    content = content.replace(/dark:text-slate-200 dark:text-slate-200/g, 'dark:text-slate-200');
    content = content.replace(/dark:border-slate-700 dark:border-slate-700/g, 'dark:border-slate-700');
    content = content.replace(/dark:bg-slate-900 dark:bg-slate-900/g, 'dark:bg-slate-900');
    
    return content;
}

const files = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/PrintableNightCountModal.tsx',
  'src/components/PrintableFlyingWingModal.tsx',
  'src/components/DutyRosterPeriodView.tsx',
  'src/components/DutyListFormattedView.tsx'
];

files.forEach(f => {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf-8');
        content = fixContent(content);
        fs.writeFileSync(f, content);
    }
});
console.log("Restored missing dark classes intelligently.");
