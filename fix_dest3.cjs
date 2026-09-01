const fs = require('fs');

['src/components/AttachmentRegisterView.tsx', 'src/components/TdyRegisterView.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let isAtt = file.includes('Attachment');
  
  content = content.replace(
    /<option value="" disabled>— Select Destination —<\/option> setAttDestination\(e\.target\.value\)}/g,
    "setAttDestination(e.target.value)}"
  );
  content = content.replace(
    /<option value="" disabled>— Select Destination —<\/option> setTdyDestination\(e\.target\.value\)}/g,
    "setTdyDestination(e.target.value)}"
  );

  let replacement = `className={\`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer \${!${isAtt ? 'attDestination' : 'tdyDestination'} ? 'border-amber-400 dark:border-amber-600 bg-amber-50/40 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-700'}\`}\n                >\n                  <option value="" disabled>— Select Destination —</option>`;
  
  let search = `className={\`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer \${!${isAtt ? 'attDestination' : 'tdyDestination'} ? 'border-amber-400 dark:border-amber-600 bg-amber-50/40 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-700'}\`}\n                >`;

  if (!content.includes(`<option value="" disabled>— Select Destination —</option>`)) {
    content = content.replace(search, replacement);
  }

  fs.writeFileSync(file, content, 'utf-8');
});
console.log('Fixed syntax in Tdy and Att');
