const fs = require('fs');

['src/components/AttachmentRegisterView.tsx', 'src/components/TdyRegisterView.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let isAtt = file.includes('Attachment');
  let destState = isAtt ? 'attDestination' : 'tdyDestination';
  
  content = content.replace(
    new RegExp(`<option value="" disabled>— Select Destination —</option> set${isAtt ? 'Att' : 'Tdy'}Destination\\(e\\.target\\.value\\)}`),
    `set${isAtt ? 'Att' : 'Tdy'}Destination(e.target.value)}`
  );

  if (!content.includes(`<option value="" disabled>— Select Destination —</option>`)) {
    content = content.replace(
      new RegExp(`(className={\`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer \\$\\{!${destState} \\? 'border-amber-400 dark:border-amber-600 bg-amber-50\\/40 dark:bg-amber-950\\/20' : 'border-slate-200 dark:border-slate-700'\\}\\`}\n\\s*>)`),
      `$1\n                  <option value="" disabled>— Select Destination —</option>`
    );
  }

  fs.writeFileSync(file, content, 'utf-8');
  console.log('Fixed', file);
});
