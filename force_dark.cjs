const fs = require('fs');

const files = [
  'src/components/NightCountStateView.tsx',
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/PrintableNightCountModal.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Specifically target the airmen list container
    content = content.replace(
      /className="max-h-56 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"/g,
      'className="max-h-56 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"'
    );

    // Some of them might still be missing it, so catch all variants:
    content = content.replace(
      /className="max-h-56 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-white/g,
      'className="max-h-56 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-white dark:bg-slate-800/80'
    );
    
    // Also, looking at the image, LAC Nishad (Canteen) row has a grey background:
    // "bg-slate-100/80 dark:bg-slate-800/60" is the class used for existing disposals.
    
    // Let's also make sure we didn't miss any "bg-white" in the modal container itself that wasn't switched.
    content = content.replace(/bg-white /g, 'bg-white dark:bg-slate-900 ');
    
    // Fix all missing text colors for disabled/unselected states
    content = content.replace(/text-slate-800  font-medium/g, 'text-slate-800 dark:text-slate-200 font-medium');

    fs.writeFileSync(file, content, 'utf-8');
  }
});
console.log("Forced dark mode on containers.");
