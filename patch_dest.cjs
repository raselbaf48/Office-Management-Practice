const fs = require('fs');

['src/components/AttachmentRegisterView.tsx', 'src/components/TdyRegisterView.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let isAtt = file.includes('Attachment');
  let destState = isAtt ? 'attDestination' : 'tdyDestination';
  
  content = content.replace(
    /className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"/,
    `className={\`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer \${!${destState} ? 'border-amber-400 dark:border-amber-600 bg-amber-50/40 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-700'}\`}`
  );
  
  // also add default empty option if missing
  if (!content.includes(`<option value="" disabled>— Select Destination —</option>`)) {
    content = content.replace(
      /(<select[^>]*value=\{)(attDestination|tdyDestination)(\}[^>]*>)/,
      `$1$2$3\n                  <option value="" disabled>— Select Destination —</option>`
    );
  }
  
  fs.writeFileSync(file, content, 'utf-8');
  console.log('Patched destination in', file);
});
