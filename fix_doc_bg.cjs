const fs = require('fs');

const files = [
  'src/components/NightCountStateView.tsx',
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/PrintableNightCountModal.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Fix NightCountStateView
    content = content.replace(
      /id="official-parade-document" className={`bg-white dark:bg-slate-900 text-black/g,
      'id="official-parade-document" className={`bg-white text-black'
    );
    
    // Fix PrintableNightCountModal
    content = content.replace(
      /id="official-parade-document"\n\s*className="bg-white dark:bg-slate-900 text-black border/g,
      'id="official-parade-document"\n        className="bg-white text-black border'
    );

    // Fix ParadeStateFormattedView
    content = content.replace(
      /id="official-parade-document"\n\s*className="bg-white dark:bg-slate-900 text-slate-900 border border-slate-300 dark:border-slate-800/g,
      'id="official-parade-document"\n        className="bg-white text-black border border-slate-300'
    );
    
    // There was another bg-white replacement in PrintableNightCountModal that hit the table rows maybe?
    // Let's check for <tr className="bg-white dark:bg-slate-900 ">
    content = content.replace(/<tr className="bg-white dark:bg-slate-900 ">/g, '<tr className="bg-white">');
    content = content.replace(/<tr className="border-b border-black bg-white dark:bg-slate-900 ">/g, '<tr className="border-b border-black bg-white">');
    
    content = content.replace(/<div className="bg-white dark:bg-slate-900 text-black shadow-2xl print:shadow-none w-\[297mm\]/g, '<div className="bg-white text-black shadow-2xl print:shadow-none w-[297mm]');

    fs.writeFileSync(file, content, 'utf-8');
  }
});
console.log("Restored white background for official documents.");
