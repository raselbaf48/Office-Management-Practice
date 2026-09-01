const fs = require('fs');

const file = 'src/components/NightCountStateView.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Multi-day block
content = content.replace(
  /\/\* OFFICIAL SIGNATURE FOOTER FOR MULTI-DAY \*\/\n            <div\n              className="flex justify-between items-end pt-1 text-black text-xs min-w-\[700px\] print:min-w-0"/,
  "/* OFFICIAL SIGNATURE FOOTER FOR MULTI-DAY */\n            {activeTab !== '155 UASU BAF' && (\n            <div\n              className=\"flex justify-between items-end pt-1 text-black text-xs min-w-[700px] print:min-w-0\""
);

// Single-day block
content = content.replace(
  /\/\* OFFICIAL SIGNATURE FOOTER \*\/\n            <div\n              className="flex justify-between items-end pt-1 text-black text-xs min-w-\[700px\] print:min-w-0"/,
  "/* OFFICIAL SIGNATURE FOOTER */\n            {activeTab !== '155 UASU BAF' && (\n            <div\n              className=\"flex justify-between items-end pt-1 text-black text-xs min-w-[700px] print:min-w-0\""
);

fs.writeFileSync(file, content, 'utf-8');
console.log("Fixed syntax");
