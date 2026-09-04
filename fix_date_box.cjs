const fs = require('fs');
const files = ['src/components/ParadeStateFormattedView.tsx', 'src/components/NightCountStateView.tsx', 'src/components/PrintableParadeStateModal.tsx', 'src/components/PrintableNightCountModal.tsx'];

for(const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /<label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">\s*1\. Select Date\s*<\/label>\s*<div>\s*<DateNavigator/g,
    '<label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">\n                      1. Select Date\n                    </label>\n                    <div className="w-56">\n                      <DateNavigator'
  );
  
  // also for edit modal:
  content = content.replace(
    /<label className="text-xs font-bold text-slate-800 dark:text-slate-200">\s*1\. Select Date\s*<\/label>\s*<div>\s*<DateNavigator/g,
    '<label className="text-xs font-bold text-slate-800 dark:text-slate-200">\n                    1. Select Date\n                  </label>\n                  <div className="w-56">\n                    <DateNavigator'
  );
  
  fs.writeFileSync(file, content);
}
console.log("Fixed date box sizes");
